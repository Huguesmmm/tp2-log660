import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Film } from './Film';

@Entity('GENRE')
export class Genre {
  @PrimaryColumn({ name: 'GENRE_ID', type: 'number' })
  genreId: number;

  @Column({ name: 'NOM', length: 50, unique: true })
  nom: string;

  // Optional: Inverse relationship
  @ManyToMany(() => Film, (film) => film.genres)
  films?: Relation<Film[]>;
}
