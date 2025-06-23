// app/dashboard/films/page.tsx
'use client';

import React, {useEffect, useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {TableFilms, type FilmFilter} from "@/components/tableFilms";
import {Badge} from "@/components/ui/badge";
import {MultiSelect, OptionType} from '@/components/ui/multiselect';
import {X} from "lucide-react";

interface FilmMetadata {
    genres: string[];
    countries: string[];
    languages: string[];
}

export default function PageFilms() {
    const [metadata, setMetadata] = useState<FilmMetadata | null>(null);
    const [filter, setFilter] = useState<FilmFilter>({});
    const [activeFilter, setActiveFilter] = useState<FilmFilter>({});
    const [resetToken, setResetToken] = useState(Date.now());

    const [currentTitreInput, setCurrentTitreInput] = useState('');
    const [currentActeurInput, setCurrentActeurInput] = useState('');
    const [currentRealisateurInput, setCurrentRealisateurInput] = useState('');

    useEffect(() => {
        const fetchMetadata = async () => {
            const res = await fetch('/api/films/meta');
            const data = await res.json();
            setMetadata(data);
        };
        fetchMetadata();
    }, []);

    const handleRunSearch = () => {
        const newFilter: FilmFilter = {};
        if (filter.titres && filter.titres?.length > 0) newFilter.titres = filter.titres;
        if (filter.acteurs && filter.acteurs?.length > 0) newFilter.acteurs = filter.acteurs;
        if (filter.realisateurs && filter.realisateurs?.length > 0) newFilter.realisateurs = filter.realisateurs;
        if (filter.genres && filter.genres?.length > 0) newFilter.genres = filter.genres;
        if (filter.pays && filter.pays?.length > 0) newFilter.pays = filter.pays;
        if (filter.languages && filter.languages?.length > 0) newFilter.languages = filter.languages;
        if (filter.anneeMin) newFilter.anneeMin = filter.anneeMin;
        if (filter.anneeMax) newFilter.anneeMax = filter.anneeMax;
        setActiveFilter(newFilter);
    };

    const mapToOptions = (items: string[] | undefined): OptionType[] => {
        return items ? items.map(item => ({ value: item, label: item })) : [];
    };

    const handleResetSearch = () => {
        setFilter({});
        setActiveFilter({});
        setResetToken(Date.now());
    }

    const handleAddTitre = () => {
        const titre = currentTitreInput.trim();
        if (titre && !filter.titres?.includes(titre)) {
            setFilter(prev => ({ ...prev, titres: [...(prev.titres || []), titre] }));
        }
        setCurrentTitreInput('');
    };

    const handleRemoveTitre = (titre: string) => {
        setFilter(prev => ({...prev, titres: prev.titres?.filter(t => t !== titre) }));
    };

    const handleAddActeur = () => {
        const acteur = currentActeurInput.trim();
        if (acteur && !filter.acteurs?.includes(acteur)) {
            setFilter(prev => ({ ...prev, acteurs: [...(prev.acteurs || []), acteur] }));
        }
        setCurrentActeurInput('');
    };

    const handleRemoveActeur = (acteur: string) => {
        setFilter(prev => ({...prev, acteurs: prev.acteurs?.filter(a => a !== acteur) }));
    }

    const handleAddRealisateur = () => {
        const rea = currentRealisateurInput.trim();
        if (rea && !filter.realisateurs?.includes(rea)) {
            setFilter(prev => ({ ...prev, realisateurs: [...(prev.realisateurs || []), rea] }));
        }
        setCurrentRealisateurInput('');
    };

    const handleRemoveRealisateur = (rea: string) => {
        setFilter(prev => ({...prev, realisateurs: prev.realisateurs?.filter(r => r !== rea) }));
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recherche de films</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className=" grid grid-cols-2 grid-flow-col grid-rows-3 gap-x-4">

                    {/* Titre */}
                    <div>
                    <label className="text-sm font-medium">Titre</label>
                    <div className="flex flex-row space-x-2">
                        <Input
                            placeholder="Ajouter un titre..."
                            value={currentTitreInput}
                            onChange={(e) => setCurrentTitreInput(e.target.value)}
                        />
                        <Button onClick={handleAddTitre} variant="secondary">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap mt-2 min-h-[30px]">
                        {filter.titres?.map(title => (
                            <Badge key={title} variant="secondary">
                                {title}
                                <button onClick={() => handleRemoveTitre(title)} className="ml-2 rounded-full outline-none">
                                    <X className="h-3 w-3 hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    </div>

                    {/* Acteur */}
                    <div>
                    <label className="text-sm font-medium">Acteur</label>
                    <div className="flex flex-row space-x-2">
                        <Input
                            placeholder="Ajouter un acteur..."
                            value={currentActeurInput}
                            onChange={(e) => setCurrentActeurInput(e.target.value)}
                        />
                        <Button onClick={handleAddActeur} variant="secondary">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                        {filter.acteurs?.map(acteur => (
                            <Badge key={acteur} variant="secondary">
                                {acteur}
                                <button onClick={() => handleRemoveActeur(acteur)} className="ml-2 rounded-full outline-none">
                                    <X className="h-3 w-3 hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    </div>

                    {/* Realisateur */}
                    <div>
                    <label className="text-sm font-medium">Realisateur</label>
                    <div className="flex flex-row space-x-2">
                        <Input
                            placeholder="Ajouter un realisateur..."
                            value={currentRealisateurInput}
                            onChange={(e) => setCurrentRealisateurInput(e.target.value)}
                        />
                        <Button onClick={handleAddRealisateur} variant="secondary">Ajouter</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                        {filter.realisateurs?.map(realisateur => (
                            <Badge key={realisateur} variant="secondary">
                                {realisateur}
                                <button onClick={() => handleRemoveRealisateur(realisateur)} className="ml-2 rounded-full outline-none">
                                    <X className="h-3 w-3 hover:text-foreground" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                    </div>

                    {/* Genre */}
                    <div>
                    <label className="text-sm font-medium">Genre</label>
                    <MultiSelect
                        title="Genres"
                        placeholder="Ajouter un genre..."
                        key={`genre-${resetToken}`}
                        options={mapToOptions(metadata?.genres)}
                        defaultValue={filter.genres || []}
                        onValueChange={(selected) => setFilter(prev => ({...prev, genres: selected}))}
                    />
                    </div>

                    {/* Pays */}
                    <div>
                    <label className="text-sm font-medium">Pays</label>
                    <MultiSelect
                        title="Pays"
                        placeholder="Ajouter un pays..."
                        key={`pays-${resetToken}`}
                        options={mapToOptions(metadata?.countries)}
                        defaultValue={filter.pays || []}
                        onValueChange={(selected) => setFilter(prev => ({...prev, pays: selected}))}
                    />
                    </div>

                    {/* Language */}
                    <div>
                    <label className="text-sm font-medium">Language</label>
                    <MultiSelect
                        title="Languages"
                        placeholder="Ajouter un language..."
                        key={`language-${resetToken}`}
                        options={mapToOptions(metadata?.languages)}
                        defaultValue={filter.languages || []}
                        onValueChange={(selected) => setFilter(prev => ({...prev, languages: selected}))}
                    />
                    </div>
                    </div>

                    {/* Annee */}
                    <div className="max-w-1/3 mt-4">
                        <div>
                            <label className="text-sm font-medium">Annee max</label>
                            <Input
                                type="number"
                                placeholder="Annee maximale (ex. 2025)"
                                value={filter.anneeMax || ''}
                                onChange={(e) => setFilter(prev => ({ ...prev, anneeMax: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-3">
                            <div>
                            <label className="text-sm font-medium">Annee min</label>
                            <Input
                                type="number"
                                placeholder="Annee minimale (ex. 1972)"
                                value={filter.anneeMin || ''}
                                onChange={(e) => setFilter(prev => ({ ...prev, anneeMin: e.target.value }))}
                            />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2 mt-5">
                        <Button onClick={handleRunSearch}>Search</Button>
                        <Button variant="outline" onClick={handleResetSearch}>Reset</Button>
                    </div>
                </CardContent>
            </Card>

            <TableFilms
                key={JSON.stringify(activeFilter)}
                filter={activeFilter}
            />
        </div>
    );
}