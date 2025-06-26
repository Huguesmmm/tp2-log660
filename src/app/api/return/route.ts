import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { AppDataSource } from "@/lib/data-source";
import { Location } from "@/entities/Location";
import { CopieFilm } from "@/entities/CopieFilm";
import { Client } from "@/entities/Client";
import { IsNull } from "typeorm";

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

    const locationRepository = queryRunner.manager.getRepository(Location);
    const copieRepository = queryRunner.manager.getRepository(CopieFilm);
    const clientRepository = queryRunner.manager.getRepository(Client);

    const location = await locationRepository.findOne({
      where: {
        copieId,
        dateRetourReelle: IsNull()
      },
      relations: ['client', 'client.forfait']
    });

    if (!location) {
      await queryRunner.rollbackTransaction();
      return NextResponse.json({
        success: false,
        error: "Copie introuvable ou déjà retournée"
      }, { status: 404 });
    }

    location.dateRetourReelle = new Date();
    await locationRepository.save(location);

    const copie = await copieRepository.findOne({
      where: { copieId }
    });
    if (copie) {
      copie.disponible = 1;
      await copieRepository.save(copie);
    }

    const now = new Date();
    const dateRetourPrevue = location.dateRetourPrevue;
    let penalite = 0;
    
    if (dateRetourPrevue && now > dateRetourPrevue) {
      const joursRetard = Math.round((now.getTime() - dateRetourPrevue.getTime()) / (1000 * 60 * 60 * 24));
      const multiplicateur = location.client.forfait.forfaitCode === 'D' ? 2 
        : location.client.forfait.forfaitCode === 'I' ? 1.5 
        : 1;
      penalite = joursRetard * multiplicateur;
    }

    await queryRunner.commitTransaction();

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