import { Entity, PrimaryColumn, Column, BeforeInsert, JoinColumn, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { Client } from './Client';

@Entity('CARTECREDIT')
export class CarteCredit {
  @PrimaryColumn({ name: 'CARTE_ID', type: 'number' })
  carteId: number;

  @Column({ name: 'CLIENT_ID', type: 'number', unique: true })
  clientId: number;

  @Column({ name: 'TYPE_CARTE', length: 20 })
  typeCarte: string;

  @Column({ name: 'NUMERO_CARTE', length: 20 })
  numeroCarte: string;

  @Column({ name: 'EXPIRATION_MOIS', type: 'number' })
  expirationMois: number;

  @Column({ name: 'EXPIRATION_ANNEE', type: 'number' })
  expirationAnnee: number;

  @Column({ name: 'CVV', length: 4 })
  cvv: string;

  @OneToOne('Client', (client: Client) => client.carteCredit)
  @JoinColumn({ name: 'CLIENT_ID', referencedColumnName: 'clientId' })
  client: Relation<Client>;

  @BeforeInsert()
  async generateId() {
    if (!this.carteId) {
      // Handle seq_carte_id.NEXTVAL
    }
  }
}
