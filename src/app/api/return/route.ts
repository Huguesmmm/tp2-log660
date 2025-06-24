import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { AppDataSource } from "@/lib/data-source";

export async function POST(req: NextRequest) {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" }, 
        { status: 401 }
      );
    }

    // 2. Validation des données
    const { copieId } = await req.json();
    if (!copieId) {
      return NextResponse.json(
        { error: "Copie ID requis" }, 
        { status: 400 }
      );
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 3. Marquer la location comme retournée
    const updated = await queryRunner.query(`
      UPDATE Locations 
      SET DATE_RETOUR_REELLE = SYSDATE
      WHERE COPIE_ID = :copieId 
        AND DATE_RETOUR_REELLE IS NULL
    `, [copieId]);

    if (!updated || updated.rowsAffected === 0) {
      await queryRunner.rollbackTransaction();
      return NextResponse.json({
        success: false,
        error: "Copie introuvable ou déjà retournée"
      }, { status: 404 });
    }

    // 4. Mettre à jour la disponibilité de la copie
    await queryRunner.query(`
      UPDATE COPIESFILMS 
      SET DISPONIBLE = 1 
      WHERE COPIE_ID = :copieId
    `, [copieId]);

    // 5. Calculer la pénalité selon le forfait du client
    const [penaliteRow] = await queryRunner.query(`
      SELECT 
        CASE
          WHEN SYSDATE > l.DATE_RETOUR_PREVUE
          THEN ROUND(SYSDATE - l.DATE_RETOUR_PREVUE) *
               CASE c.FORFAIT_CODE 
                 WHEN 'D' THEN 2    -- Forfait Débutant
                 WHEN 'I' THEN 1.5  -- Forfait Intermédiaire
                 WHEN 'A' THEN 1    -- Forfait Avancé
                 ELSE 2             -- Par défaut
               END
          ELSE 0
        END AS PENALITE
      FROM Locations l
      JOIN Clients c ON c.CLIENT_ID = l.CLIENT_ID
      WHERE l.COPIE_ID = :copieId
    `, [copieId]);

    await queryRunner.commitTransaction();

    const penalite = penaliteRow?.PENALITE || 0;

    return NextResponse.json({
      success: true,
      message: "Film retourné avec succès",
      penalite: penalite,
      result: penalite > 0 ? `Pénalité de $${penalite} appliquée` : 'Retour effectué'
    });

  } catch (error) {
    console.error("❌ Erreur retour:", error);
    
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    // Erreur "Copie inconnue"
    if (errorMessage.includes('Copie inconnue') || errorMessage.includes('-20002')) {
      return NextResponse.json({
        success: false,
        error: "Copie introuvable ou déjà retournée"
      }, { status: 404 });
    }

    // Erreur générique
    return NextResponse.json({
      success: false,
      error: "Erreur lors du retour"
    }, { status: 500 });
  } finally {
    await queryRunner.release();
  }
} 