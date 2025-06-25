import "server-only";
import { AppDataSource } from "@/lib/data-source";
import { Film } from "@/entities/Film";

// DTO for transferring film data to client components
export interface FilmDTO {
  filmId: number;
  titre: string;
  anneeSortie: number;
  dureeMinutes: number;
  langueOriginale?: string;
  resumeScenario?: string;
  afficheUrl?: string;
}

// DTO for film details dialog
export interface FilmDetailDTO {
  // Basic info
  filmId: number;
  titre: string;
  anneeSortie: number;
  dureeMinutes: number;
  langueOriginale?: string;
  resumeScenario?: string;
  afficheUrl?: string;
  
  // Relations
  genres: { genreId: number; nom: string }[];
  pays: { paysId: number; nom: string }[];
  realisateurs: { artisteId: number; nom: string }[];
  scenaristes: { artisteId: number; nom: string }[];
  acteurs: { artisteId: number; nom: string; personnage?: string, photoUrl?: string }[];
  bandesAnnonces: { bandeAnnonceId: number; url: string }[];
  
  // Rental availability
  copiesTotal: number;
  copiesDisponibles: number;
}

// interface pour la location
export interface RentalRequest {
  filmId: number;
  userId: string;
}

export interface RentalResult {
  success: boolean;
  message: string;
  locationId?: number;
}

export interface FilmSearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof FilmDTO;
  sortOrder?: 'asc' | 'desc';
}

export interface FilmsResponse {
  data: FilmDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// funciotn pour convertir le Film en FilmDTO
function filmToDTO(film: Film): FilmDTO {
  return {
    filmId: film.filmId,
    titre: film.titre,
    anneeSortie: film.anneeSortie,
    dureeMinutes: film.dureeMinutes,
    langueOriginale: film.langueOriginale,
    resumeScenario: film.resumeScenario,
    afficheUrl: film.afficheUrl,
  };
}

export async function getFilmDetails(filmId: number): Promise<FilmDetailDTO> {
  try {
    // Initialize database connection if needed
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const filmRepository = AppDataSource.getRepository(Film);
    
    const film = await filmRepository
      .createQueryBuilder("film")
      .leftJoinAndSelect("film.genres", "genre")
      .leftJoinAndSelect("film.pays", "pays")
      .leftJoinAndSelect("film.realisateurs", "realisateur")
      .leftJoinAndSelect("film.scenaristes", "filmScenariste")
      .leftJoinAndSelect("film.acteurs", "filmActeur")
      .leftJoinAndSelect("filmActeur.artiste", "acteur")
      .leftJoinAndSelect("film.copies", "copie")
      .where("film.filmId = :filmId", { filmId })
      .getOne();

    if (!film) {
      throw new Error(`Film with ID ${filmId} not found`);
    }

    const copiesTotal = film.copies?.length || 0;
    const copiesDisponibles = film.copies?.filter(copie => copie.disponible === 1).length || 0;

    // Transformer le film en FilmDetailDTO
    const filmDetail: FilmDetailDTO = {
      filmId: film.filmId,
      titre: film.titre,
      anneeSortie: film.anneeSortie,
      dureeMinutes: film.dureeMinutes,
      langueOriginale: film.langueOriginale,
      resumeScenario: film.resumeScenario,
      afficheUrl: film.afficheUrl,
      genres: film.genres?.map(g => ({ genreId: g.genreId, nom: g.nom })) || [],
      pays: film.pays?.map(p => ({ paysId: p.paysId, nom: p.nom })) || [],
      realisateurs: film.realisateurs?.map(r => ({ 
        artisteId: r.artisteId, 
        nom: r.nom 
      })) || [],
      scenaristes: film.scenaristes?.map((fs, index) => ({ 
        artisteId: index + 1, 
        nom: fs.nom 
      })) || [],
      acteurs: film.acteurs?.map(fa => ({ 
        artisteId: fa.artiste.artisteId, 
        nom: fa.artiste.nom,
        personnage: fa.personnage,
        photoUrl: fa.artiste.photoUrl
      })) || [],
      bandesAnnonces: [], 
      copiesTotal,
      copiesDisponibles,
    };

    return filmDetail;

  } catch (error) {
    console.error("Error fetching film details:", error);
    throw new Error("Failed to fetch film details");
  }
}

export async function getFilms(params: FilmSearchParams = {}): Promise<FilmsResponse> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const {
      search = "",
      page = 1,
      pageSize = 10,
      sortBy = "titre",
      sortOrder = "asc"
    } = params;

    const filmRepository = AppDataSource.getRepository(Film);

    let queryBuilder = filmRepository
      .createQueryBuilder("film");

    if (search) {
      queryBuilder = queryBuilder.where(
        "LOWER(film.titre) LIKE LOWER(:search)",
        { search: `%${search}%` }
      );
    }

    queryBuilder = queryBuilder.orderBy(`film.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const total = await queryBuilder.getCount();

    // Add pagination - for server side pagination
    // const offset = (page - 1) * pageSize;
    // queryBuilder = queryBuilder.skip(offset).take(pageSize);

    const films = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: films.map(filmToDTO), // Convertir les entités en FilmDTO
      total,
      page,
      pageSize,
      totalPages,
    };

  } catch (error) {
    console.error("Error fetching films:", error);
    throw new Error("Failed to fetch films");
  }
}
