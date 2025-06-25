import { AppDataSource } from "@/lib/data-source";
import { Client } from "@/entities/Client";
import { Location } from "@/entities/Location";

/**
 * Service – Cas 4 : location de films
 * -----------------------------------------------------------
 * • Toute la logique est encapsulée dans une transaction.
 * • Le trigger `trg_stock_location` se charge de passer la copie
 *   à `DISPONIBLE = 0`; on ne le fait donc plus ici.
 * • Sélection de la copie protégée par `FOR UPDATE SKIP LOCKED`
 *   pour éviter les problèmes de concurrence (ORA‑00001 / 20001).
 * • **INSERT** effectué avec **TypeORM** (plus de SQL brut).
 */
export class RentalService {
  /**
   * Loue une copie disponible d'un film pour un client
   */
  public static async rentFilm(clientId: number, filmId: number): Promise<Location> {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    const qr = ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const [forfaitRow] = await qr.manager.query(
        `SELECT f.locations_max AS max_loc,
                f.duree_max_jours AS max_days
           FROM Clients c JOIN Forfait f ON f.forfait_code = c.forfait_code
          WHERE c.client_id = :clientId`,
        { clientId } as any
      );
      if (!forfaitRow) throw new Error("Client introuvable ou forfait inexistant");
      const { MAX_LOC, MAX_DAYS } = forfaitRow;
      const [{ ACTIVE }] = await qr.manager.query(
        `SELECT COUNT(*) AS active
           FROM Locations
          WHERE client_id = :clientId
            AND date_retour_reelle IS NULL`,
        { clientId } as any
      );
      if (ACTIVE >= MAX_LOC) throw new Error("Limite de locations atteinte pour votre forfait.");
      const [copyRow] = await qr.manager.query(
        `SELECT copie_id
           FROM CopiesFilms
          WHERE film_id = :filmId
            AND disponible = 1
          FOR UPDATE SKIP LOCKED
          FETCH FIRST 1 ROWS ONLY`,
        { filmId } as any
      );
      if (!copyRow) throw new Error("Aucune copie disponible pour ce film.");
      const copieId: string = copyRow.COPIE_ID;
      const now = new Date();
      const due = MAX_DAYS ? new Date(now.getTime() + MAX_DAYS * 86_400_000) : null;
      const location = qr.manager.create(Location, {
        clientId,
        copieId,
        dateLocation: now,
        dateRetourPrevue: due ?? undefined,
      });
      await qr.manager.save(location);
      await qr.commitTransaction();
      return location;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  /**
   * Renvoie les locations d'un client avec pénalité courante.
   */
  public static async getClientRentals(clientId: number) {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    return ds.query(
      `SELECT l.location_id,
              l.copie_id,
              l.date_location,
              l.date_retour_prevue,
              l.date_retour_reelle,
              f.titre,
              f.annee_sortie,
              f.affiche_url,
              CASE WHEN l.date_retour_reelle IS NULL AND l.date_retour_prevue < SYSDATE THEN
                   ROUND(SYSDATE - l.date_retour_prevue) *
                   CASE c.forfait_code WHEN 'D' THEN 2 WHEN 'I' THEN 1.5 ELSE 1 END
                   ELSE 0 END AS penalite_courante,
              CASE WHEN l.date_retour_reelle IS NOT NULL THEN 'RETOURNEE'
                   WHEN l.date_retour_prevue < SYSDATE THEN 'EN_RETARD'
                   ELSE 'EN_COURS' END AS statut
         FROM Locations l
         JOIN CopiesFilms cf ON cf.copie_id = l.copie_id
         JOIN Films f        ON f.film_id   = cf.film_id
         JOIN Clients c      ON c.client_id = l.client_id
        WHERE l.client_id = :clientId
        ORDER BY l.date_location DESC`,
      { clientId } as any
    );
  }

  /**
   * Retourne un snapshot du quota restant.
   */
  public static async checkClientQuota(clientId: number) {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    const [row] = await ds.query(
      `SELECT f.locations_max,
              (SELECT COUNT(*) FROM Locations WHERE client_id = :cli AND date_retour_reelle IS NULL) AS active
         FROM Clients c JOIN Forfait f ON f.forfait_code = c.forfait_code
        WHERE c.client_id = :cli`,
      { cli: clientId } as any
    );
    if (!row) throw new Error("Client introuvable.");
    return {
      locationsActives: row.ACTIVE,
      locationsMax: row.LOCATIONS_MAX,
      canRent: row.ACTIVE < row.LOCATIONS_MAX,
    };
  }
}
