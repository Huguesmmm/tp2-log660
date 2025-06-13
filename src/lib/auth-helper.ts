"use server";

import { Client } from "@/entities/Client";
import { AppDataSource } from "@/lib/data-source"
import { compare } from "bcrypt-ts"

export async function validateCredentials(email: string, password: string) {
  try {
    // Initialize database connection if needed
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    // Find user in database
    const clientRepository = AppDataSource.getRepository(Client)
    const client = await clientRepository.findOne({
      where: {
        personne: {
          courriel: email,
        },
      },
      relations: ["personne"],
    })

    if (!client) {
      console.log('🔍 Pas de client trouvé pour cet email:', email);
      return null
    }

    console.log('🔍 password trouvé:', client.motPasse);

    // Verify password
    const passwordsMatch = await compare(
      password,
      client.motPasse
    )

    if (passwordsMatch) {
      return {
        id: client.clientId.toString(),
        email: client.personne.courriel,
        name: `${client.personne.prenom} ${client.personne.nom}`,
      }
    }

    return null
  } catch (error) {
    console.error("Database error during authentication:", error)
    return null
  }
}
