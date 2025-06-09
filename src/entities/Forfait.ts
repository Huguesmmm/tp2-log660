
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { Client } from './Client';

@Entity('FORFAIT')
export class Forfait {
  @PrimaryColumn({ name: 'FORFAIT_CODE', type: 'char', length: 1 })
  forfaitCode: string;

  @Column({ name: 'NOM', length: 50, unique: true })
  nom: string;

  @Column({ name: 'COUT', type: 'decimal', precision: 5, scale: 2 })
  cout: number;

  @Column({ name: 'LOCATIONS_MAX', type: 'number' })
  locationsMax: number;

  @Column({ name: 'DUREE_MAX_JOURS', type: 'number', nullable: true })
  dureeMaxJours?: number;

  @OneToMany(() => Client, (client) => client.forfait)
  clients?: Relation<Client[]>;
}
