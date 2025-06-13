import { Entity, PrimaryColumn, Column, ManyToMany, BeforeInsert } from 'typeorm';
import type { Relation } from 'typeorm';
import { Film } from './Film';

@Entity('PAYS')
export class Pays {
  @PrimaryColumn({ name: 'PAYS_ID', type: 'number' })
  paysId: number;

  @Column({ name: 'NOM', length: 100, unique: true })
  nom: string;

  // Relationships (inverse side of ManyToMany)
  @ManyToMany('Film', (film: Film) => film.pays)
  films?: Relation<Film[]>;

  @BeforeInsert()
  async generateId() {
    if (!this.paysId) {
      // Handle seq_pays_id.NEXTVAL
    }
  }
}
