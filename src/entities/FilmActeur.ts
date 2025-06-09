import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Artiste } from './Artiste';
import { Film } from './Film';

@Entity('FILM_ACTEUR')
export class FilmActeur {
  @PrimaryColumn({ name: 'FILM_ID', type: 'number' })
  filmId: number;

  @PrimaryColumn({ name: 'ARTISTE_ID', type: 'number' })
  artisteId: number;

  @Column({ name: 'PERSONNAGE', length: 200, nullable: true })
  personnage?: string; // This is why we keep this junction table

  // Relationships
  @ManyToOne(() => Film, (film) => film.acteurs)
  @JoinColumn({ name: 'FILM_ID', referencedColumnName: 'filmId' })
  film: Relation<Film>;

  @ManyToOne(() => Artiste, (artiste) => artiste.filmsJoues)
  @JoinColumn({ name: 'ARTISTE_ID', referencedColumnName: 'artisteId' })
  artiste: Relation<Artiste>;
}
