// Types for Film table display and operations

import { Film } from "@/entities/Film";

// Flattened interface for table display
export interface FilmTableData {
  filmId: number;
  titre: string;
  anneeSortie: number;
  dureeMinutes: number;
  langueOriginale?: string;
  // Flattened relationship data for display
  genres: string[]; // Array of genre names
  pays: string[]; // Array of country names
  realisateurs: string[]; // Array of director names
  nombreCopies: number; // Count of available copies
}

// Search and filter types
export interface FilmSearchParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: keyof FilmTableData;
  sortOrder?: 'asc' | 'desc';
}

// API response type
export interface FilmsResponse {
  data: Film[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
