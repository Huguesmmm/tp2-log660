import 'reflect-metadata';
import * as typeorm from 'typeorm';
import type { ProfilClient } from './ProfilClient';
// import { ProfilEmploye } from './ProfilEmploye';

@typeorm.Entity('PERSONNE') // ou 'PERSONNES' selon votre vraie table
export class Personne {
  @typeorm.PrimaryGeneratedColumn({ name: 'ID_PERSONNE' })
  idPersonne: number;

  @typeorm.Column({ name: 'PRENOM', length: 50 })
  prenom: string;

  @typeorm.Column({ name: 'NOM', length: 50 })
  nom: string;

  @typeorm.Column({ name: 'COURRIEL', length: 100, unique: true })
  courriel: string;

  @typeorm.Column({ name: 'NUM_TELEPHONE', length: 20, nullable: true })
  numTelephone?: string;

  @typeorm.Column({ name: 'DATE_NAISSANCE', type: 'date' })
  dateNaissance: Date;

  @typeorm.Column({ name: 'ID_ADRESSE' })
  idAdresse: number;

  @typeorm.OneToOne('ProfilClient', (profilClient: ProfilClient) => profilClient.personne)
  profilClient: typeorm.Relation<ProfilClient>;

  // @OneToOne(() => ProfilEmploye, profilEmploye => profilEmploye.personne)
  // profilEmploye?: ProfilEmploye;
}
