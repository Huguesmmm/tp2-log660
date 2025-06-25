import oracledb from "oracledb";

// Forcer Oracle Client
try {
  oracledb.initOracleClient({ libDir: "C:\oracle\instantclient_19_26" });
} catch (err) {
  console.log("Oracle Client déjà initialisé ou erreur:", err.message);
}

import { DataSource } from 'typeorm';
import 'reflect-metadata';
import * as dotenv from "dotenv";

import { Personne } from '@/entities/Personne';
import { Forfait } from '@/entities/Forfait';
import { Film } from '@/entities/Film';
import { Genre } from '@/entities/Genre';
import { Pays } from '@/entities/Pays';
import { CopieFilm } from '@/entities/CopieFilm';
import { Client } from '@/entities/Client';
import { Employe } from '@/entities/Employe';
import { Artiste } from '@/entities/Artiste';
import { BandeAnnonce } from '@/entities/BandeAnnonce';
import { CarteCredit } from '@/entities/CarteCredit';
import { FilmActeur } from '@/entities/FilmActeur';
import { Location } from '@/entities/Location';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "oracle",
  host:     process.env.DB_HOST,          // bdlog660.ens.ad.etsmtl.ca
  port:     Number(process.env.DB_PORT),  // 1521
  serviceName: process.env.DB_SERVICE_NAME, // ORCLPDB.ens.ad.etsmtl.ca
  username: process.env.DB_USERNAME,      // EQUIPE203
  password: process.env.DB_PASSWORD,      // MVXBpwOX
  schema:   process.env.DB_USERNAME,      // EQUIPE203 (Oracle = schéma = user)
  logging:  true,         // ou false en prod
  synchronize: false,     // jamais true en Oracle prod
  entities: [ __dirname + "/../../entities/**/*.{ts,js}" ],
});
