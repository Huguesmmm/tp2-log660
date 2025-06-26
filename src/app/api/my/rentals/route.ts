import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { RentalService } from "@/lib/services/RentalService";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" }, 
        { status: 401 }
      );
    }

    const clientId = Number(session.user.id);
    const rentals = await RentalService.getClientRentals(clientId);

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
