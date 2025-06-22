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

// Helper function to convert Film entity to DTO
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

export async function getFilms(params: FilmSearchParams = {}): Promise<FilmsResponse> {
  try {
    // Initialize database connection if needed
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

    // Build query with relations - start simple and add one by one
    let queryBuilder = filmRepository
      .createQueryBuilder("film");

    // Add search functionality
    if (search) {
      queryBuilder = queryBuilder.where(
        "LOWER(film.titre) LIKE LOWER(:search)",
        { search: `%${search}%` }
      );
    }

    // Add sorting
    queryBuilder = queryBuilder.orderBy(`film.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Add pagination
    const offset = (page - 1) * pageSize;
    queryBuilder = queryBuilder.skip(offset).take(pageSize);

    // Execute query
    const films = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: films.map(filmToDTO), // Convert entities to DTOs
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
