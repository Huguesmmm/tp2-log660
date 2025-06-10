import { Entity, PrimaryColumn, Column, ManyToMany, BeforeInsert, JoinTable, OneToMany} from 'typeorm';
import type { Relation } from 'typeorm';
import { Artiste } from './Artiste';
import { Genre } from './Genre';
import { CopieFilm } from './CopieFilm';
import { Pays } from './Pays';
import { FilmActeur } from './FilmActeur';
import { BandeAnnonce } from './BandeAnnonce';

@Entity('FILMS')
export class Film {
  @PrimaryColumn({ name: 'FILM_ID', type: 'number' })
  filmId: number;

  @Column({ name: 'TITRE', length: 200 })
  titre: string;

  @Column({ name: 'ANNEE_SORTIE', type: 'number' })
  anneeSortie: number;

  @Column({ name: 'LANGUE_ORIGINALE', length: 50, nullable: true })
  langueOriginale?: string;

  @Column({ name: 'DUREE_MINUTES', type: 'number' })
  dureeMinutes: number;

  @Column({ name: 'RESUME_SCENARIO', type: 'clob', nullable: true })
  resumeScenario?: string;

  @Column({ name: 'AFFICHE_URL', length: 255, nullable: true })
  afficheUrl?: string;

  // Relationships using @ManyToMany (simplified)
  @ManyToMany(() => Genre)
  @JoinTable({
    name: 'FILM_GENRE',
    joinColumn: { name: 'FILM_ID', referencedColumnName: 'filmId' },
    inverseJoinColumn: { name: 'GENRE_ID', referencedColumnName: 'genreId' }
  })
  genres: Relation<Genre[]>;

  @ManyToMany(() => Pays)
  @JoinTable({
    name: 'FILM_PAYS',
    joinColumn: { name: 'FILM_ID', referencedColumnName: 'filmId' },
    inverseJoinColumn: { name: 'PAYS_ID', referencedColumnName: 'paysId' }
  })
  pays: Relation<Pays[]>;

  @ManyToMany(() => Artiste)
  @JoinTable({
    name: 'FILM_REALISATEUR',
    joinColumn: { name: 'FILM_ID', referencedColumnName: 'filmId' },
    inverseJoinColumn: { name: 'ARTISTE_ID', referencedColumnName: 'artisteId' }
  })
  realisateurs: Relation<Artiste[]>;

  @ManyToMany(() => Artiste)
  @JoinTable({
    name: 'FILM_SCENARISTE',
    joinColumn: { name: 'FILM_ID', referencedColumnName: 'filmId' },
    inverseJoinColumn: { name: 'ARTISTE_ID', referencedColumnName: 'artisteId' }
  })
  scenaristes: Relation<Artiste[]>;

  // Keep FilmActeur as junction table (has 'personnage' column)
  @OneToMany(() => FilmActeur, (fa) => fa.film)
  acteurs: Relation<FilmActeur[]>;

  @OneToMany(() => CopieFilm, (copie) => copie.film)
  copies: Relation<CopieFilm[]>;

  @OneToMany(() => BandeAnnonce, (ba) => ba.film)
  bandesAnnonces?: Relation<BandeAnnonce[]>;

  @BeforeInsert()
  async generateId() {
    if (!this.filmId) {
      // Handle seq_film_id.NEXTVAL
    }
  }
}
