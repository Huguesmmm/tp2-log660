import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { RentalService } from "@/lib/services/RentalService";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" }, 
        { status: 401 }
      );
    }

    const { filmId } = await req.json();
    if (!filmId) {
      return NextResponse.json(
        { error: "Film ID requis" }, 
        { status: 400 }
      );
    }

    const result = await RentalService.rentFilm(
      Number(session.user.id), 
      Number(filmId)
    );

    return NextResponse.json({
      success: true,
      message: "Film loué avec succès",
      location: {
        locationId: result.locationId,
        copieId: result.copieId,
        dateLocation: result.dateLocation,
        dateRetourPrevue: result.dateRetourPrevue
      }
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Erreur location:", error);

    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";

    // Oracle-specific error mapping
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

    // Business logic error mapping
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

    // Generic error
    return NextResponse.json({
      success: false,
      error: "Erreur lors de la location"
    }, { status: 500 });
  }
}
