import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import type { Relation } from 'typeorm';
import { Film } from './Film';

@Entity('BANDEANNONCE')
export class BandeAnnonce {
  @PrimaryColumn({ name: 'BANDE_ANNONCE_ID', type: 'number' })
  bandeAnnonceId: number;

  @Column({ name: 'FILM_ID', type: 'number' })
  filmId: number;

  @Column({ name: 'URL', length: 255 })
  url: string;

  // Relationships
  @ManyToOne(() => Film, (film) => film.bandesAnnonces)
  @JoinColumn({ name: 'FILM_ID', referencedColumnName: 'filmId' })
  film: Relation<Film>;

  @BeforeInsert()
  async generateId() {
    if (!this.bandeAnnonceId) {
      // Handle seq_bande_annonce_id.NEXTVAL
    }
  }
}
