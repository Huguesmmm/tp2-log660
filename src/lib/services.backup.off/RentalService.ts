import { getDataSource } from '@/lib/data-source';
import oracledb from 'oracledb';

/** Loue un film via la procédure Oracle p_louer_film */
export async function louerFilmViaProcedure(clientId: number, filmId: number) {
  const ds = await getDataSource();
  const conn = await ds.driver.obtainMasterConnection(); // ① connexion brute

  try {
    const res = await conn.execute(
      `DECLARE
         v_copie  VARCHAR2(20);
         v_result VARCHAR2(100);
       BEGIN
         p_louer_film(:client, :film, v_copie, v_result);
         :copie_out  := v_copie;
         :result_out := v_result;
       END;`,
      {
        client:     clientId,
        film:       filmId,
        copie_out:  { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        result_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      }
    );

    if (res.outBinds!.result_out !== 'SUCCES') {
      throw new Error(res.outBinds!.result_out as string);
    }
    
    return { 
      success: true, 
      copieId: res.outBinds!.copie_out as string,
      message: 'Film loué avec succès!'
    };
  } finally {
    await conn.close(); // ② libère la connexion
  }
}

/** Retourne un film via la procédure Oracle p_retour_film_avec_penalites */
export async function retournerFilmViaProcedure(copieId: string) {
  const ds = await getDataSource();
  const conn = await ds.driver.obtainMasterConnection();

  try {
    const res = await conn.execute(
      `DECLARE
         v_pen  NUMBER := 0;
         v_res  VARCHAR2(100);
       BEGIN
         p_retour_film_avec_penalites(:copie, v_pen, v_res);
         :pen_out  := v_pen;
         :result_out := v_res;
       END;`,
      {
        copie:      copieId,
        pen_out:    { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        result_out: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
      }
    );

    if (res.outBinds!.result_out !== 'SUCCES') {
      throw new Error(res.outBinds!.result_out as string);
    }
    
    return { 
      success: true, 
      penalite: Number(res.outBinds!.pen_out),
      message: 'Film retourné avec succès!'
    };
  } finally {
    await conn.close();
  }
}

/** Lister les films disponibles avec copies (via ta vue) */
export async function obtenirFilmsDisponibles() {
  const ds = await getDataSource();
  
  try {
    // Utiliser ta vue v_films_disponibles créée dans ton schema
    const films = await ds.query(`
      SELECT 
        film_id,
        titre,
        annee_sortie,
        duree_minutes,
        total_copies,
        copies_disponibles,
        statut_disponibilite
      FROM v_films_disponibles 
      WHERE copies_disponibles > 0
      ORDER BY titre
    `);
    
    return films;
  } catch (error) {
    console.error('Erreur récupération films:', error);
    throw error;
  }
}
