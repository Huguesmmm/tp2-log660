import {Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from 'typeorm';
import { Film } from "./Film";

@Entity("FILM_SCENARISTE")
export class FilmScenariste {
    @PrimaryColumn({ name: "FILM_ID", type: "number" })
    filmId: number;

    @PrimaryColumn({ name: "NOM", length: 150 })
    nom: string;

    @ManyToOne("Film", (film: Film) => film.scenaristes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "FILM_ID", referencedColumnName: "filmId" })
    film: Relation<Film>;
}
