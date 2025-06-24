import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FilmCard } from "@/components/FilmCard";
import RentalsTable from "@/components/RentalsTable";
import { AppDataSource } from "@/lib/data-source";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const clientId = Number(session.user.id);

  try {
    // Récupérer les films disponibles avec alias cohérents
    const filmsDisponibles = await AppDataSource.query(`
      SELECT f.film_id AS FILM_ID, f.titre AS TITRE, f.annee_sortie AS ANNEE_SORTIE, 
             f.duree_minutes AS DUREE_MINUTES, f.affiche_url AS AFFICHE_URL,
             COUNT(cf.copie_id) AS TOTAL_COPIES,
             SUM(cf.disponible) AS COPIES_DISPONIBLES
      FROM Films f
      LEFT JOIN CopiesFilms cf ON f.film_id = cf.film_id
      GROUP BY f.film_id, f.titre, f.annee_sortie, f.duree_minutes, f.affiche_url
      HAVING SUM(cf.disponible) > 0
      ORDER BY f.titre
    `);

    // Récupérer les locations du client avec alias cohérents
    const locations = await AppDataSource.query(`
      SELECT 
        l.location_id AS LOCATION_ID,
        l.copie_id AS COPIE_ID,
        l.date_location AS DATE_LOCATION,
        l.date_retour_prevue AS DATE_RETOUR_PREVUE,
        l.date_retour_reelle AS DATE_RETOUR_REELLE,
        f.titre AS TITRE,
        f.annee_sortie AS ANNEE_SORTIE,
        f.duree_minutes AS DUREE_MINUTES,
        f.affiche_url AS AFFICHE_URL,
        -- Calcul de la pénalité si en retard selon le forfait du client
        CASE 
          WHEN l.date_retour_reelle IS NULL 
               AND l.date_retour_prevue < SYSDATE 
          THEN ROUND(SYSDATE - l.date_retour_prevue) *
               CASE c.forfait_code
                 WHEN 'D' THEN 2    -- Forfait Débutant
                 WHEN 'I' THEN 1.5  -- Forfait Intermédiaire  
                 WHEN 'A' THEN 1    -- Forfait Avancé
                 ELSE 2             -- Par défaut
               END
          ELSE 0 
        END AS PENALITE_COURANTE,
        -- Statut de la location
        CASE 
          WHEN l.date_retour_reelle IS NOT NULL THEN 'RETOURNEE'
          WHEN l.date_retour_prevue < SYSDATE THEN 'EN_RETARD'
          ELSE 'EN_COURS'
        END AS STATUT
      FROM Locations l
      JOIN CopiesFilms cf ON l.copie_id = cf.copie_id
      JOIN Films f ON cf.film_id = f.film_id
      JOIN Clients c ON l.client_id = c.client_id
      WHERE l.client_id = :clientId
      ORDER BY l.date_location DESC
    `, [clientId]);

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8">Mon Dashboard</h1>
          
          {/* Section Locations */}
          <div className="w-full max-w-6xl mb-12">
            <h2 className="text-2xl font-semibold mb-4">Mes Locations</h2>
            <RentalsTable rentals={locations} />
          </div>

          {/* Section Films Disponibles */}
          <div className="w-full max-w-6xl">
            <h2 className="text-2xl font-semibold mb-6">Films Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filmsDisponibles.map((film: any) => (
                <FilmCard 
                  key={film.FILM_ID} 
                  film={{
                    FILM_ID: film.FILM_ID,
                    TITRE: film.TITRE,
                    ANNEE_SORTIE: film.ANNEE_SORTIE,
                    DUREE_MINUTES: film.DUREE_MINUTES,
                    AFFICHE_URL: film.AFFICHE_URL,
                    COPIES_DISPONIBLES: film.COPIES_DISPONIBLES
                  }} 
                />
              ))}
            </div>
            
            {filmsDisponibles.length === 0 && (
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

