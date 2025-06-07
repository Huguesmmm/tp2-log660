"use server";

import { AppDataSource } from "@/lib/data-source"
import { ProfilClient } from "@/entities/ProfilClient"
import { compare } from "bcrypt-ts"

export async function validateCredentials(email: string, password: string) {
  try {
    // Initialize database connection if needed
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    // Find user in database
    const profilClientRepository = AppDataSource.getRepository(ProfilClient)
    const profilClient = await profilClientRepository.findOne({
      where: {
        personne: {
          courriel: email,
        },
      },
      relations: ["personne"],
    })

    if (!profilClient) {
      return null
    }

    // Verify password
    const passwordsMatch = await compare(
      password,
      profilClient.motDePasseHash
    )

    if (passwordsMatch) {
      return {
        id: profilClient.idPersonne.toString(),
        email: profilClient.personne.courriel,
        name: `${profilClient.personne.prenom} ${profilClient.personne.nom}`,
      }
    }

    return null
  } catch (error) {
    console.error("Database error during authentication:", error)
    return null
  }
}
