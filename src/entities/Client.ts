import {
	Entity,
	PrimaryColumn,
	Column,
	OneToOne,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Personne } from "./Personne";
import { Forfait } from "./Forfait";
import { CarteCredit } from "./CarteCredit";
import { Location } from "./Location";

@Entity("CLIENTS")
export class Client {
	@PrimaryColumn({ name: "CLIENT_ID", type: "number" })
	clientId: number;

	@Column({ name: "MOT_PASSE", length: 60 })
	motPasse: string;

	@Column({ name: "FORFAIT_CODE", type: "char", length: 1 })
	forfaitCode: string;

	// Relationships
	@OneToOne("Personne", 'client')
	@JoinColumn({ name: "CLIENT_ID", referencedColumnName: "personneId" })
	personne: Relation<Personne>;

	@ManyToOne("Forfait", (forfait: Forfait) => forfait.clients)
	@JoinColumn({ name: "FORFAIT_CODE", referencedColumnName: "forfaitCode" })
	forfait: Relation<Forfait>;

	@OneToOne("CarteCredit", (carte: CarteCredit) => carte.client)
	carteCredit?: Relation<CarteCredit>;

	@OneToMany("Location", (location: Location) => location.client)
	locations?: Relation<Location[]>;
}
