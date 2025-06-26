import { AppDataSource } from "@/lib/data-source";
import { Client } from "@/entities/Client";
import { Location } from "@/entities/Location";
import { CopieFilm } from "@/entities/CopieFilm";
import { IsNull } from "typeorm";

export class RentalService {
  public static async rentFilm(clientId: number, filmId: number): Promise<Location> {
    // Use consistent database connection pattern
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const qr = AppDataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    
    try {
      const clientRepository = qr.manager.getRepository(Client);
      const client = await clientRepository.findOne({
        where: { clientId },
        relations: ['forfait']
      });
      
      if (!client?.forfait) {
        throw new Error("Client introuvable ou forfait inexistant");
      }

      // Check rental quota
      const locationsActives = await qr.manager.count(Location, {
        where: {
          clientId,
          dateRetourReelle: IsNull()
        }
      });
      
      if (locationsActives >= client.forfait.locationsMax) {
        throw new Error("Limite de locations atteinte pour votre forfait");
      }

      // Find available copy with pessimistic lock
      const copyRepository = qr.manager.getRepository(CopieFilm);
      const copy = await copyRepository
        .createQueryBuilder("copie")
        .where("copie.filmId = :filmId", { filmId })
        .andWhere("copie.disponible = 1")
        .setLock("pessimistic_write")
        .getOne();

      if (!copy) {
        throw new Error("Aucune copie disponible pour ce film");
      }

      // Calculate return date
      const now = new Date();
      const due = client.forfait.dureeMaxJours 
        ? new Date(now.getTime() + client.forfait.dureeMaxJours * 86_400_000) 
        : null;

      console.log('Rental debug:', {
        clientId,
        forfaitCode: client.forfait.forfaitCode,
        dureeMaxJours: client.forfait.dureeMaxJours,
        now: now.toISOString(),
        due: due?.toISOString()
      });

      // Create rental record using TypeORM repository.save()
      const locationRepository = qr.manager.getRepository(Location);
      const newLocation = locationRepository.create({
        clientId,
        copieId: copy.copieId,
        dateLocation: now,
        dateRetourPrevue: due ?? undefined,
      });

      console.log('Before save - newLocation:', {
        clientId: newLocation.clientId,
        copieId: newLocation.copieId,
        dateLocation: newLocation.dateLocation,
        dateRetourPrevue: newLocation.dateRetourPrevue,
        due: due
      });

      // Save will handle the Oracle sequence automatically
      const location = await locationRepository.save(newLocation);
      
      console.log('After save - location:', {
        locationId: location.locationId,
        clientId: location.clientId,
        copieId: location.copieId,
        dateLocation: location.dateLocation,
        dateRetourPrevue: location.dateRetourPrevue
      });

      // FIX: Mark copy as unavailable
      copy.disponible = 0;
      await qr.manager.save(copy);

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
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const locationRepository = AppDataSource.getRepository(Location);

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

      // Return camelCase format instead of UPPERCASE
      return {
        locationId: location.locationId,
        copieId: location.copieId,
        dateLocation: location.dateLocation,
        dateRetourPrevue: location.dateRetourPrevue,
        dateRetourReelle: location.dateRetourReelle,
        titre: location.copieFilm.film.titre,
        anneeSortie: location.copieFilm.film.anneeSortie,
        afficheUrl: location.copieFilm.film.afficheUrl,
        penaliteCourante: penaliteCourante,
        statut: statut
      };
    });
  }

  public static async checkClientQuota(clientId: number) {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const clientRepository = AppDataSource.getRepository(Client);

    const client = await clientRepository.findOne({
      where: { clientId },
      relations: ['forfait']
    });

    if (!client) {
      throw new Error("Client introuvable");
    }

    const locationsActives = await AppDataSource.getRepository(Location).count({
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