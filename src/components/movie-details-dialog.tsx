"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Globe, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilmDTO, FilmDetailDTO, RentalRequest } from "@/lib/films";

interface MovieDetailsDialogProps {
  film: FilmDTO;
  onRentClick?: (request: RentalRequest) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MovieDetailsDialog({
  film,
  onRentClick,
  open = false,
  onOpenChange,
}: MovieDetailsDialogProps) {
  const [filmDetails, setFilmDetails] = useState<FilmDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilmDetails = async () => {
    if (filmDetails && filmDetails.filmId === film.filmId) return;

    setIsLoading(true);
    setError(null);
    setFilmDetails(null); // Clear previous details

    try {
      const response = await fetch(`/api/films/${film.filmId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch film details: ${response.status}`);
      }

      const details = await response.json();
      setFilmDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset details when film changes
  useEffect(() => {
    if (filmDetails && filmDetails.filmId !== film.filmId) {
      setFilmDetails(null);
      setError(null);
    }
  }, [film.filmId, filmDetails]);

  // Auto-fetch when dialog opens or film changes
  useEffect(() => {
    if (open && film) {
      fetchFilmDetails();
    }
  }, [open, film.filmId]);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleRentClick = () => {
    if (filmDetails && onRentClick) {
      onRentClick({
        filmId: filmDetails.filmId,
        userId: "current-user", // This will be replaced with actual session user
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{film.titre}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Loading film details...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-destructive mb-2">Error loading details</p>
                <p className="text-muted-foreground text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchFilmDetails}
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {filmDetails && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Poster */}
                <div className="space-y-4">
                  <div className="w-full aspect-[2/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {filmDetails.afficheUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={filmDetails.afficheUrl.replace(
                          "http://",
                          "https://",
                        )}
                        alt={`${filmDetails.titre} poster`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const container = target.parentElement;
                          if (container) {
                            container.innerHTML = `
                              <div class="text-center text-muted-foreground">
                                <svg class="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-sm">Image failed to load</p>
                                <p class="text-xs mt-1 opacity-70">IMDb image unavailable</p>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No poster available</p>
                      </div>
                    )}
                  </div>

                  {/* Bouton pour la location*/}
                  <Button
                    onClick={handleRentClick}
                    disabled={filmDetails.copiesDisponibles === 0}
                    className="w-full"
                    size="lg"
                  >
                    {filmDetails.copiesDisponibles > 0
                      ? "Rent Now"
                      : "Not Available"}
                  </Button>

                  {/* Availability Info */}
                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      {filmDetails.copiesDisponibles} of{" "}
                      {filmDetails.copiesTotal} copies available
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-4">
                  {/* Basic Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{filmDetails.anneeSortie}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(filmDetails.dureeMinutes)}</span>
                    </div>
                    {filmDetails.langueOriginale && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <span>{filmDetails.langueOriginale}</span>
                      </div>
                    )}
                  </div>

                  {/* Genres */}
                  {filmDetails.genres.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {filmDetails.genres.map((genre) => (
                          <Badge key={genre.genreId} variant="secondary">
                            {genre.nom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Countries */}
                  {filmDetails.pays.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Countries</h3>
                      <div className="flex flex-wrap gap-2">
                        {filmDetails.pays.map((country) => (
                          <Badge key={country.paysId} variant="outline">
                            {country.nom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plot */}
                  {filmDetails.resumeScenario && (
                    <div>
                      <h3 className="font-semibold mb-2">Plot</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {filmDetails.resumeScenario}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Cast & Crew */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Directors */}
                {filmDetails.realisateurs.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Directors
                    </h3>
                    <div className="space-y-1">
                      {filmDetails.realisateurs.map((director) => (
                        <p
                          key={director.artisteId}
                          className="text-muted-foreground"
                        >
                          {director.nom}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Writers */}
                {filmDetails.scenaristes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Writers</h3>
                    <div className="space-y-1">
                      {filmDetails.scenaristes.map((writer) => (
                        <p
                          key={writer.artisteId}
                          className="text-muted-foreground"
                        >
                          {writer.nom}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cast */}
              {filmDetails.acteurs.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filmDetails.acteurs.slice(0, 12).map((actor) => (
                      <div
                        key={actor.artisteId}
                        className="flex flex-col items-center text-center space-y-2"
                      >
                        {/* Photo with fallback */}
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                          {actor.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={actor.photoUrl.replace("http://", "https://")}
                              alt={actor.nom} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {/* Name and character */}
                        <div>
                          <p className="text-sm font-medium">{actor.nom}</p>
                          {actor.personnage && (
                            <p className="text-xs text-muted-foreground">{actor.personnage}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {filmDetails.acteurs.length > 12 && (
                      <p className="text-sm text-muted-foreground italic col-span-full text-center">
                        ... and {filmDetails.acteurs.length - 12} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Trailers section removed - table doesn't exist in current schema */}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
