import { DataSource } from 'typeorm';
import 'reflect-metadata';

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

export const AppDataSource = new DataSource({
  type: 'oracle',
  host: process.env.DB_HOST || 'big-data-3.logti.etsmtl.ca',
  port: parseInt(process.env.DB_PORT || '1521'),
  serviceName: process.env.DB_SERVICE_NAME || 'LOG660',
  username: process.env.DB_USERNAME, // EQUIPEXX
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_USERNAME, // EQUIPEXX en majuscules (LOG660)
  synchronize: false, // Important: false pour ne pas modifier votre schéma existant
  // logging: process.env.NODE_ENV === 'development',
  logging: true,
  entities: [
    Personne,
    Client,
    Employe,
    CarteCredit,
    Artiste,
    BandeAnnonce,
    Forfait,
    Film,
    FilmActeur,
    CopieFilm,
    Genre,
    Pays,
    Location,
  ],
});
