import {
	Entity,
	PrimaryColumn,
	Column,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from "typeorm";
import type { Relation } from "typeorm";
import { Film } from "./Film";
import { Location } from "./Location";

@Entity("COPIESFILMS")
export class CopieFilm {
	@PrimaryColumn({ name: "COPIE_ID", length: 20 })
	copieId: string;

	@Column({ name: "FILM_ID", type: "number" })
	filmId: number;

	@Column({ name: "DISPONIBLE", type: "number", default: 1 })
	disponible: number; // 0 or 1

	// Relationships
	@ManyToOne("Film", (film: Film) => film.copies)
	@JoinColumn({ name: "FILM_ID", referencedColumnName: "filmId" })
	film: Relation<Film>;

	@OneToMany(() => Location, (location: Location) => location.copieFilm)
	locations?: Relation<Location[]>;
}
