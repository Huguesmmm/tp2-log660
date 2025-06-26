import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FilmCard } from "@/components/FilmCard";
import RentalsTable from "@/components/RentalsTable";
import { AppDataSource } from "@/lib/data-source";
import { Location } from "@/entities/Location";
import { Film } from "@/entities/Film";
import { CopieFilm } from "@/entities/CopieFilm";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const clientId = Number(session.user.id);

  try {
    const ds = await (AppDataSource.isInitialized ? AppDataSource : AppDataSource.initialize());
    
    const filmRepository = ds.getRepository(Film);
    const filmsDisponibles = await filmRepository
      .createQueryBuilder("film")
      .leftJoin("film.copies", "copie")
      .addSelect("COUNT(copie.copieId)", "totalCopies")
      .addSelect("SUM(copie.disponible)", "copiesDisponibles")
      .groupBy("film.filmId")
      .addGroupBy("film.titre")
      .addGroupBy("film.anneeSortie")
      .addGroupBy("film.dureeMinutes")
      .addGroupBy("film.afficheUrl")
      .having("SUM(copie.disponible) > 0")
      .orderBy("film.titre")
      .getRawMany();

    const locationRepository = ds.getRepository(Location);
    const locations = await locationRepository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.client", "client")
      .leftJoinAndSelect("location.copieFilm", "copie")
      .leftJoinAndSelect("copie.film", "film")
      .leftJoinAndSelect("client.forfait", "forfait")
      .where("location.clientId = :clientId", { clientId })
      .orderBy("location.dateLocation", "DESC")
      .getMany();

    const locationsFormatted = locations.map(location => {
      const now = new Date();
      const dateRetourPrevue = location.dateRetourPrevue;
      const dateRetourReelle = location.dateRetourReelle;
      
      let penaliteCourante = 0;
      if (!dateRetourReelle && dateRetourPrevue && now > dateRetourPrevue) {
        const joursRetard = Math.round((now.getTime() - dateRetourPrevue.getTime()) / (1000 * 60 * 60 * 24));
        const multiplicateur = location.client.forfait.forfaitCode === 'D' ? 2 
          : location.client.forfait.forfaitCode === 'I' ? 1.5 
          : 1;
        penaliteCourante = joursRetard * multiplicateur;
      }
      
      let statut = 'EN_COURS';
      if (dateRetourReelle) statut = 'RETOURNEE';
      else if (dateRetourPrevue && now > dateRetourPrevue) statut = 'EN_RETARD';
      
      return {
        LOCATION_ID: location.locationId,
        COPIE_ID: location.copieId,
        DATE_LOCATION: location.dateLocation,
        DATE_RETOUR_PREVUE: location.dateRetourPrevue,
        DATE_RETOUR_REELLE: location.dateRetourReelle,
        TITRE: location.copieFilm.film.titre,
        ANNEE_SORTIE: location.copieFilm.film.anneeSortie,
        DUREE_MINUTES: location.copieFilm.film.dureeMinutes,
        AFFICHE_URL: location.copieFilm.film.afficheUrl,
        PENALITE_COURANTE: penaliteCourante,
        STATUT: statut
      };
    });

    const filmsFormatted = filmsDisponibles.map((film: any) => ({
      FILM_ID: film.film_filmId,
      TITRE: film.film_titre,
      ANNEE_SORTIE: film.film_anneeSortie,
      DUREE_MINUTES: film.film_dureeMinutes,
      AFFICHE_URL: film.film_afficheUrl,
      COPIES_DISPONIBLES: parseInt(film.copiesDisponibles)
    }));

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">Mon Dashboard</h1>
          
          <div className="w-full max-w-6xl mb-12">
            <h2 className="text-2xl font-semibold mb-4">Mes Locations</h2>
            <RentalsTable rentals={locationsFormatted} />
          </div>

          <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-semibold mb-6">Films Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filmsFormatted.map((film: any) => (
                <FilmCard 
                  key={film.FILM_ID} 
                  film={film}
                />
              ))}
            </div>
            
            {filmsFormatted.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Aucun film disponible pour le moment
              </p>
            )}
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Erreur dashboard:', error);
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="text-red-600">
            Une erreur est survenue lors du chargement du dashboard
          </p>
        </div>
      </div>
    );
  }
}

