import type { Relation } from 'typeorm';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Client } from './Client';
import { CopieFilm } from './CopieFilm';
import { AppDataSource } from '@/lib/data-source';

@Entity('LOCATIONS')
export class Location {
  @PrimaryColumn({ name: 'LOCATION_ID', type: 'number' })
  locationId: number;

  @Column({ name: 'CLIENT_ID', type: 'number' })
  clientId: number;

  @Column({ name: 'COPIE_ID', length: 20, unique: true })
  copieId: string;

  @Column({ name: 'DATE_LOCATION', type: 'date' })
  dateLocation: Date;

  @Column({ name: 'DATE_RETOUR_PREVUE', type: 'date', nullable: true })
  dateRetourPrevue?: Date;

  @Column({ name: 'DATE_RETOUR_REELLE', type: 'date', nullable: true })
  dateRetourReelle?: Date;

  // Relationships
  @ManyToOne(() => Client, (client: Client) => client.locations)
  @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
  client: Relation<Client>;

  // Changé de @OneToOne vers @ManyToOne pour l'historique des locations
  @ManyToOne(() => CopieFilm, (copie: CopieFilm) => copie.locations)
  @JoinColumn({ name: 'COPIE_ID', referencedColumnName: 'copieId' })
  copieFilm: Relation<CopieFilm>;

  @BeforeInsert()
  async generateId() {
    if (!this.locationId) {
      // Implémentation réelle de la séquence Oracle
      const [{ NEXTVAL }] = await AppDataSource.query(
        "SELECT seq_location_id.NEXTVAL FROM dual"
      );
      this.locationId = Number(NEXTVAL);
    }
  }
}
