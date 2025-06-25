import { NextRequest, NextResponse } from "next/server";
import { getFilmDetails } from "@/lib/films";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const filmId = parseInt(resolvedParams.id);
    
    if (isNaN(filmId)) {
      return NextResponse.json(
        { error: "Invalid film ID" },
        { status: 400 }
      );
    }

    const filmDetails = await getFilmDetails(filmId);
    return NextResponse.json(filmDetails);
    
  } catch (error) {
    console.error("Error fetching film details:", error);
    return NextResponse.json(
      { error: "Failed to fetch film details" },
      { status: 500 }
    );
  }
}