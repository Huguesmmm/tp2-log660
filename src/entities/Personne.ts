import { Entity, PrimaryColumn, Column, OneToOne, BeforeInsert } from 'typeorm';
import type { Relation } from 'typeorm';
import { Client } from './Client';
import { Employe } from './Employe';

@Entity('PERSONNES')
export class Personne {
  @PrimaryColumn({ name: 'PERSONNE_ID', type: 'number' })
  personneId: number;

  @Column({ name: 'NOM', length: 100 })
  nom: string;

  @Column({ name: 'PRENOM', length: 100 })
  prenom: string;

  @Column({ name: 'COURRIEL', length: 100, unique: true })
  courriel: string;

  @Column({ name: 'TELEPHONE', length: 20, nullable: true })
  telephone?: string;

  @Column({ name: 'DATE_NAISSANCE', type: 'date' })
  dateNaissance: Date;

  @Column({ name: 'NO_CIVIQUE', length: 20 })
  noCivique: string;

  @Column({ name: 'RUE', length: 100 })
  rue: string;

  @Column({ name: 'VILLE', length: 100 })
  ville: string;

  @Column({ name: 'PROVINCE', length: 100 })
  province: string;

  @Column({ name: 'CODE_POSTAL', length: 10 })
  codePostal: string;

  // Relationships
  @OneToOne(() => Client, (client) => client.personne)
  client?: Relation<Client>;

  @OneToOne(() => Employe, (employe) => employe.personne)
  employe?: Relation<Employe>;

  // Handle sequence manually if needed
  @BeforeInsert()
  async generateId() {
    if (!this.personneId) {
      // You'd implement sequence fetching here
      // const result = await connection.query('SELECT seq_personne_id.NEXTVAL FROM DUAL');
      // this.personneId = result[0].NEXTVAL;
    }
  }
}
