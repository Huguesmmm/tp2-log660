import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { ProfilClient } from './ProfilClient';
// import { ProfilEmploye } from './ProfilEmploye';

@Entity('PERSONNE') // ou 'PERSONNES' selon votre vraie table
export class Personne {
  @PrimaryGeneratedColumn({ name: 'ID_PERSONNE' })
  idPersonne: number;

  @Column({ name: 'PRENOM', length: 50 })
  prenom: string;

  @Column({ name: 'NOM', length: 50 })
  nom: string;

  @Column({ name: 'COURRIEL', length: 100, unique: true })
  courriel: string;

  @Column({ name: 'NUM_TELEPHONE', length: 20, nullable: true })
  numTelephone?: string;

  @Column({ name: 'DATE_NAISSANCE', type: 'date' })
  dateNaissance: Date;

  @Column({ name: 'ID_ADRESSE' })
  idAdresse: number;

  @OneToOne(() => ProfilClient, profilClient => profilClient.personne)
  profilClient?: ProfilClient;

  // @OneToOne(() => ProfilEmploye, profilEmploye => profilEmploye.personne)
  // profilEmploye?: ProfilEmploye;
}
