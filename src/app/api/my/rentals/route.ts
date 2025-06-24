import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AppDataSource } from "@/lib/data-source";

export async function GET() {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" }, 
        { status: 401 }
      );
    }

    const clientId = Number(session.user.id);

    // 2. Récupération des locations avec calcul des pénalités par forfait
    // Note: Utilisation d'alias cohérents pour éviter les problèmes de casse
    const rentals = await AppDataSource.query(`
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

    return NextResponse.json({
      success: true,
      rentals: rentals,
      count: rentals.length
    });

  } catch (error) {
    console.error("❌ Erreur récupération locations:", error);
    
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la récupération des locations"
    }, { status: 500 });
  }
} 