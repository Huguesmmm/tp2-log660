import { AppDataSource } from "@/lib/data-source";
import { Client } from "@/entities/Client";
import { Location } from "@/entities/Location";
import { CopieFilm } from '@/entities/CopieFilm';
import { IsNull } from 'typeorm';

/**
 * Service centralisant toute la logique métier liée à la location d'un film (Cas 4).
 * Les validations sont faites côté application ; aucune dépendance à des triggers Oracle.
 */
export class RentalService {
  /**
   * Loue un film pour un client avec validation complète
   */
  static async rentFilm(clientId: number, filmId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // 1. Vérifier que le client existe et récupérer son forfait
      const client = await queryRunner.manager.findOne(Client, {
        where: { clientId },
        relations: ['forfait']
      });

      if (!client) {
        throw new Error('Client introuvable');
      }

      const forfait = client.forfait;
      if (!forfait) {
        throw new Error('Forfait introuvable');
      }

      // 2. Vérifier le quota de locations actives
      const locationsActives = await queryRunner.manager.count(Location, {
        where: {
          clientId,
          dateRetourReelle: IsNull() // Pas encore retourné
        }
      });

      if (locationsActives >= forfait.locationsMax) {
        throw new Error(`Limite de locations atteinte (${forfait.locationsMax} max)`);
      }

      // 3. Trouver une copie disponible du film avec lock pour éviter les conflits
      const [row] = await queryRunner.manager.query(
        `SELECT copie_id
           FROM CopiesFilms
          WHERE film_id = :filmId
            AND disponible = 1
          FOR UPDATE SKIP LOCKED
          FETCH FIRST 1 ROWS ONLY`,
        [filmId]
      );
      if (!row) throw new Error("Aucune copie disponible pour ce film.");
      const copieId: string = row.COPIE_ID;

      // 4. Calculer la date de retour prévue
      const dateLocation = new Date();
      const dateRetourPrevue = new Date(dateLocation);
      dateRetourPrevue.setDate(dateRetourPrevue.getDate() + (forfait.dureeMaxJours || 7));

      // 5. Créer la location
      const location = new Location();
      location.clientId = clientId;
      location.copieId = copieId;
      location.dateLocation = dateLocation;
      location.dateRetourPrevue = dateRetourPrevue;

      // Générer l'ID de location via séquence Oracle
      const [{ NEXTVAL }] = await queryRunner.query(
        "SELECT seq_location_id.NEXTVAL FROM dual"
      );
      location.locationId = Number(NEXTVAL);

      // 6. Sauvegarder la location
      // Note: Le trigger Oracle trg_stock_location mettra automatiquement à jour 
      // COPIESFILMS.DISPONIBLE = 0 lors de l'insertion de la location
      await queryRunner.manager.save(location);

      // 7. Commit de la transaction
      await queryRunner.commitTransaction();

      return {
        locationId: location.locationId,
        copieId: location.copieId,
        dateLocation: location.dateLocation,
        dateRetourPrevue: location.dateRetourPrevue,
        forfait: forfait.nom,
        dureeMax: forfait.dureeMaxJours
      };

    } catch (error) {
      // Rollback en cas d'erreur
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Libérer le query runner
      await queryRunner.release();
    }
  }

  /**
   * Récupère les locations d'un client avec pénalités
   */
  static async getClientRentals(clientId: number) {
    try {
      const rentals = await AppDataSource.query(`
        SELECT 
          l.location_id,
          l.copie_id,
          l.date_location,
          l.date_retour_prevue,
          l.date_retour_reelle,
          f.titre,
          f.annee_sortie,
          f.duree_minutes,
          f.affiche_url,
          -- Calcul de la pénalité si en retard selon le forfait du client
          CASE 
            WHEN l.date_retour_reelle IS NULL 
                 AND l.date_retour_prevue < SYSDATE 
            THEN ROUND(SYSDATE - l.date_retour_prevue) *
                 CASE c.forfait_code
                   WHEN 'D' THEN 2    -- Forfait Débutant
                   WHEN 'I' THEN 1.5  -- Forfait Intermédiaire  
                   WHEN 'A' THEN 1    -- Forfait Avancé
                   ELSE 2             -- Par défaut
                 END
            ELSE 0 
          END AS penalite_courante,
          -- Statut de la location
          CASE 
            WHEN l.date_retour_reelle IS NOT NULL THEN 'RETOURNEE'
            WHEN l.date_retour_prevue < SYSDATE THEN 'EN_RETARD'
            ELSE 'EN_COURS'
          END AS statut
        FROM Locations l
        JOIN CopiesFilms cf ON l.copie_id = cf.copie_id
        JOIN Films f ON cf.film_id = f.film_id
        JOIN Clients c ON l.client_id = c.client_id
        WHERE l.client_id = :clientId
        ORDER BY l.date_location DESC
      `, [clientId]);

      return rentals;

    } catch (error) {
      throw new Error(`Erreur récupération locations: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifie le quota de locations d'un client
   */
  static async checkClientQuota(clientId: number) {
    try {
      const client = await AppDataSource.manager.findOne(Client, {
        where: { clientId },
        relations: ['forfait']
      });

      if (!client?.forfait) {
        throw new Error('Client ou forfait introuvable');
      }

      const locationsActives = await AppDataSource.manager.count(Location, {
        where: {
          clientId,
          dateRetourReelle: IsNull()
        }
      });

      return {
        locationsActives,
        locationsMax: client.forfait.locationsMax,
        canRent: locationsActives < client.forfait.locationsMax,
        forfait: client.forfait.nom
      };

    } catch (error) {
      throw new Error(`Erreur vérification quota: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}
