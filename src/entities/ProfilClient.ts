import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Personne } from './Personne';

@Entity('PROFILCLIENT') // ou 'CLIENTS' selon votre vraie table
export class ProfilClient {
  @PrimaryColumn({ name: 'ID_PERSONNE' })
  idPersonne: number;

  @Column({ name: 'FORFAIT_CODE', length: 10 })
  forfaitCode: string;

  @Column({ name: 'MOT_DE_PASSE_HASH', length: 255 })
  motDePasseHash: string;

  @OneToOne(() => Personne, personne => personne.profilClient)
  @JoinColumn({ name: 'ID_PERSONNE' })
  personne: Personne;
}
