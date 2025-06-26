import type { Relation } from 'typeorm';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { AppDataSource } from '@/lib/data-source';
import { Client } from './Client';
import { CopieFilm } from './CopieFilm';

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
  @ManyToOne('Client', (client: Client) => client.locations)
  @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
  client: Relation<Client>;

  @OneToOne('CopieFilm', (copie: CopieFilm) => copie.location)
  @JoinColumn({ name: 'COPIE_ID', referencedColumnName: 'copieId' })
  copieFilm: Relation<CopieFilm>;

  @BeforeInsert()
  async generateId() {
    if (!this.locationId) {
      // Get next value from Oracle sequence
      const result = await AppDataSource.query('SELECT seq_location_id.NEXTVAL as id FROM dual');
      this.locationId = result[0].ID;
    }
  }
}
