import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { RentalService } from "@/lib/services/RentalService";

export async function POST(req: NextRequest) {
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
    const { filmId } = await req.json();
    if (!filmId) {
      return NextResponse.json(
        { error: "Film ID requis" }, 
        { status: 400 }
      );
    }

    // 3. Location via le service
    const result = await RentalService.rentFilm(
      Number(session.user.id), 
      Number(filmId)
    );

    return NextResponse.json({
      success: true,
      message: "Film loué avec succès",
      location: result
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur location:", error);
    
    // 4. Mapping des erreurs Oracle
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    // Erreurs Oracle spécifiques
    if (errorMessage.includes('-20001')) {
      return NextResponse.json({
        success: false,
        error: "Cette copie vient tout juste d'être louée"
      }, { status: 409 });
    }
    
    if (errorMessage.includes('-20002')) {
      return NextResponse.json({
        success: false,
        error: "Copie introuvable"
      }, { status: 404 });
    }
    
    if (errorMessage.includes('-20003')) {
      return NextResponse.json({
        success: false,
        error: "Limite de locations atteinte pour votre forfait"
      }, { status: 409 });
    }

    // Erreurs métier du service
    if (errorMessage.includes('quota') || errorMessage.includes('limite')) {
      return NextResponse.json({
        success: false,
        error: "Limite de locations atteinte pour votre forfait"
      }, { status: 409 });
    }

    if (errorMessage.includes('disponible') || errorMessage.includes('copie')) {
      return NextResponse.json({
        success: false,
        error: "Aucune copie disponible pour ce film"
      }, { status: 409 });
    }

    // Erreur générique
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la location"
    }, { status: 500 });
  }
} 