import { AppDataSource } from "@/lib/data-source";
import { Client } from "@/entities/Client";
import { Location } from "@/entities/Location";
import { Forfait } from "@/entities/Forfait";
import { CopieFilm } from "@/entities/CopieFilm";
import { Film } from "@/entities/Film";
import { IsNull } from "typeorm";

export class RentalService {
  public static async rentFilm(clientId: number, filmId: number): Promise<Location> {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    const qr = ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const clientRepository = qr.manager.getRepository(Client);
      const client = await clientRepository.findOne({
        where: { clientId },
        relations: ['forfait']
      });
      if (!client?.forfait) throw new Error("Client introuvable ou forfait inexistant");
      
      const locationsActives = await qr.manager.count(Location, {
        where: {
          clientId,
          dateRetourReelle: IsNull()
        }
      });
      if (locationsActives >= client.forfait.locationsMax) {
        throw new Error("Limite de locations atteinte pour votre forfait.");
      }

      const copyRepository = qr.manager.getRepository(CopieFilm);
      const copy = await copyRepository
        .createQueryBuilder("copie")
        .where("copie.filmId = :filmId", { filmId })
        .andWhere("copie.disponible = 1")
        .setLock("pessimistic_write")
        .getOne();
      
      if (!copy) throw new Error("Aucune copie disponible pour ce film.");
      
      const now = new Date();
      const due = client.forfait.dureeMaxJours 
        ? new Date(now.getTime() + client.forfait.dureeMaxJours * 86_400_000) 
        : null;
      
      const location = qr.manager.create(Location, {
        clientId,
        copieId: copy.copieId,
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

  public static async getClientRentals(clientId: number) {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    const locationRepository = ds.getRepository(Location);
    
    const locations = await locationRepository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.client", "client")
      .leftJoinAndSelect("location.copieFilm", "copie")
      .leftJoinAndSelect("copie.film", "film")
      .leftJoinAndSelect("client.forfait", "forfait")
      .where("location.clientId = :clientId", { clientId })
      .orderBy("location.dateLocation", "DESC")
      .getMany();

    return locations.map(location => {
      const now = new Date();
      const dateRetourPrevue = location.dateRetourPrevue;
      const dateRetourReelle = location.dateRetourReelle;
      
      let penaliteCourante = 0;
      if (!dateRetourReelle && dateRetourPrevue && now > dateRetourPrevue) {
        const joursRetard = Math.round((now.getTime() - dateRetourPrevue.getTime()) / (1000 * 60 * 60 * 24));
        const multiplicateur = location.client.forfait.forfaitCode === 'D' ? 2 
          : location.client.forfait.forfaitCode === 'I' ? 1.5 
          : 1;
        penaliteCourante = joursRetard * multiplicateur;
      }
      
      let statut = 'EN_COURS';
      if (dateRetourReelle) statut = 'RETOURNEE';
      else if (dateRetourPrevue && now > dateRetourPrevue) statut = 'EN_RETARD';
      
      return {
        location_id: location.locationId,
        copie_id: location.copieId,
        date_location: location.dateLocation,
        date_retour_prevue: location.dateRetourPrevue,
        date_retour_reelle: location.dateRetourReelle,
        titre: location.copieFilm.film.titre,
        annee_sortie: location.copieFilm.film.anneeSortie,
        affiche_url: location.copieFilm.film.afficheUrl,
        penalite_courante: penaliteCourante,
        statut: statut
      };
    });
  }

  public static async checkClientQuota(clientId: number) {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    const clientRepository = ds.getRepository(Client);
    
    const client = await clientRepository.findOne({
      where: { clientId },
      relations: ['forfait']
    });
    
    if (!client) throw new Error("Client introuvable.");
    
    const locationsActives = await ds.getRepository(Location).count({
      where: {
        clientId,
        dateRetourReelle: IsNull()
      }
    });
    
    return {
      locationsActives,
      locationsMax: client.forfait.locationsMax,
      canRent: locationsActives < client.forfait.locationsMax,
    };
  }
}
