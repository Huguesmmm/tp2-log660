import 'reflect-metadata';
import * as typeorm from 'typeorm';
import type { Personne } from './Personne';

@typeorm.Entity('PROFILCLIENT') // ou 'CLIENTS' selon votre vraie table
export class ProfilClient {
  @typeorm.PrimaryColumn({ name: 'ID_PERSONNE' })
  idPersonne: number;

  @typeorm.Column({ name: 'FORFAIT_CODE', length: 10 })
  forfaitCode: string;

  @typeorm.Column({ name: 'MOT_DE_PASSE_HASH', length: 255 })
  motDePasseHash: string;

  @typeorm.OneToOne('Personne', (personne: Personne) => personne.profilClient) // String relation
  @typeorm.JoinColumn({ name: 'ID_PERSONNE' })
  personne: typeorm.Relation<Personne>;
}
