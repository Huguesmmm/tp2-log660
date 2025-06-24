import type { Relation } from "typeorm";
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Personne } from "./Personne";

@Entity("EMPLOYES")
export class Employe {
	@PrimaryColumn({ name: "EMPLOYE_ID", type: "number" })
	employeId: number;

	@Column({ name: "MATRICULE", type: "char", length: 7, unique: true })
	matricule: string;

	@Column({ name: "MOT_PASSE", length: 60 })
	motPasse: string;

	@OneToOne("Personne", 'employe')
	@JoinColumn({ name: "EMPLOYE_ID", referencedColumnName: "personneId" })
	personne: Relation<Personne>;
}
