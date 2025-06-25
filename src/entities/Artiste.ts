import 'reflect-metadata';
import { Entity, Column, OneToMany, BeforeInsert, ManyToMany, PrimaryColumn} from 'typeorm';
import type { Relation } from 'typeorm';
import { Film } from './Film';
import { FilmActeur } from './FilmActeur';

@Entity('ARTISTE')
export class Artiste {
  @PrimaryColumn({ name: 'ARTISTE_ID', type: 'number' })
  artisteId: number;

  @Column({ name: 'NOM', length: 100 })
  nom: string;

  @Column({ name: 'DATE_NAISSANCE', type: 'date', nullable: true })
  dateNaissance?: Date;

  @Column({ name: 'LIEU_NAISSANCE', length: 100, nullable: true })
  lieuNaissance?: string;

  @Column({ name: 'PHOTO_URL', length: 255, nullable: true })
  photoUrl?: string;

  @Column({ name: 'BIOGRAPHIE', type: 'clob', nullable: true })
  biographie?: string;

  // Relationships (inverse side of ManyToMany)
  @ManyToMany('Film', (film: Film) => film.realisateurs)
  filmsDiriges?: Relation<Film[]>;

  @ManyToMany('Film', (film: Film) => film.scenaristes)
  filmsEcrits?: Relation<Film[]>;

  @OneToMany('FilmActeur', (fa: FilmActeur) => fa.artiste)

  filmsJoues?: Relation<FilmActeur[]>;

  @BeforeInsert()
  async generateId() {
    if (!this.artisteId) {
      // Handle seq_artiste_id.NEXTVAL
    }
  }
}
