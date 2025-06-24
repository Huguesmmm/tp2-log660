import { getDataSource } from '@/lib/data-source';

export async function getFilmsDisponibles() {
  try {
    const ds = await getDataSource();
    
    const films = await ds.query(`
      SELECT f.film_id, f.titre, f.annee_sortie, f.duree_minutes, f.affiche_url,
             COUNT(cf.copie_id) AS total_copies,
             SUM(cf.disponible) AS copies_disponibles
      FROM Films f
      LEFT JOIN CopiesFilms cf ON f.film_id = cf.film_id
      GROUP BY f.film_id, f.titre, f.annee_sortie, f.duree_minutes, f.affiche_url
      HAVING SUM(cf.disponible) > 0
      ORDER BY f.titre
    `);
    
    return films;
  } catch (error) {
    console.error('Erreur récupération films:', error);
    return [];
  }
}

export async function getMyRentals(clientId: number) {
  try {
    const ds = await getDataSource();
    
    const rentals = await ds.query(`
      SELECT l.location_id, l.copie_id, f.titre,
             l.date_location, l.date_retour_prevue, l.date_retour_reelle
      FROM Locations l
      JOIN CopiesFilms c ON l.copie_id = c.copie_id
      JOIN Films f       ON c.film_id = f.film_id
      WHERE l.client_id = :clientId
      ORDER BY l.date_location DESC
    `, [clientId]);
    
    return rentals;
  } catch (error) {
    console.error('Erreur récupération locations:', error);
    return [];
  }
}
