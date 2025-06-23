'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react"

type FilmRow = {
    filmId: number;
    titre: string;
    anneeSortie: number;
};

export type FilmFilter = {
    titres?: string[];
    anneeMin?: string;
    anneeMax?: string;
    pays?: string[];
    languages?: string[];
    genres?: string[];
    realisateurs?: string[];
    acteurs?: string[];
}

interface FilmFilterInterface {
    filter: FilmFilter;
}

export function TableFilms({ filter }: FilmFilterInterface) {
    const [films, setFilms] = useState<FilmRow[]>([]);
    const [done, setDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const sentinel = useRef<HTMLDivElement | null>(null);

    const takeSize = 50;
    const skipRef = useRef(0);

    const loadFilms = useCallback(async () => {
        if (isLoading || done) return;
        setIsLoading(true);

        const params = new URLSearchParams();
        params.append('skip', skipRef.current.toString());
        params.append('take', takeSize.toString());

        if (filter.titres && filter.titres.length > 0) {
            filter.titres.forEach(titre => params.append('titre', titre));
        }

        if (filter.acteurs && filter.acteurs.length > 0) {
            filter.acteurs.forEach(acteur => params.append('acteur', acteur));
        }

        if (filter.realisateurs && filter.realisateurs.length > 0) {
            filter.realisateurs.forEach(realisateur => params.append('realisateur', realisateur));
        }

        if (filter.genres && filter.genres.length > 0) {
            filter.genres.forEach(genre => params.append('genre', genre));
        }

        if (filter.languages && filter.languages.length > 0) {
            filter.languages.forEach(language => params.append('language', language));
        }

        if (filter.pays && filter.pays.length > 0) {
            filter.pays.forEach(pays => params.append('pays', pays));
        }

        if (filter.anneeMin) {
            params.append('anneeMin', filter.anneeMin);
        }

        if (filter.anneeMax) {
            params.append('anneeMax', filter.anneeMax);
        }

        const res = await fetch(`/api/films?${params.toString()}`);
        const json = (await res.json()) as { data: FilmRow[] };

        if (json.data.length > 0) {
            setFilms(prev => [...prev, ...json.data]);
            skipRef.current += json.data.length;
        }

        if (json.data.length < 50) {
            setDone(true);
        }

        setIsLoading(false);
    }, [isLoading, filter, done]);

    // Infinite scroll
    useEffect(() => {
        const target = sentinel.current;
        if (!target) return;

        const io = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadFilms();
            }
        });

        io.observe(target);
        return () => io.disconnect();
    }, [loadFilms]);

    return (
        <ScrollArea className='h-screen'>
            <div className="space-y-2">
                {films.map(f => (
                    <Card key={f.filmId} className="text-sm px-5 py-2">
                        {f.titre} ({f.anneeSortie})
                    </Card>
                ))}
            </div>

            <div ref={sentinel} className="h-10 flex justify-center items-center">
                {!done && isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
                {done && films.length === 0 && <p className="text-sm text-muted-foreground">Aucun résultat.</p>}
            </div>
        </ScrollArea>
    );
}