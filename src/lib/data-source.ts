import { DataSource } from 'typeorm';
import 'reflect-metadata';

import { Personne } from '@/entities/Personne';
import { ProfilClient } from '@/entities/ProfilClient';
import { ProfilEmploye } from '@/entities/ProfilEmploye';
import { Forfait } from '@/entities/Forfait';
import { Film } from '@/entities/Film';
import { Genre } from '@/entities/Genre';
import { Langue } from '@/entities/Langue';
import { Pays } from '@/entities/Pays';
import { Copie } from '@/entities/Copie';
import { Location } from '@/entities/Location';
import { LocationCopie } from '@/entities/LocationCopie';
import { Adresse } from '@/entities/Adresse';
import { FichePersonne } from '@/entities/FichePersonne';

export const AppDataSource = new DataSource({
  type: 'oracle',
  host: process.env.DB_HOST || 'big-data-3.logti.etsmtl.ca',
  port: parseInt(process.env.DB_PORT || '1521'),
  serviceName: process.env.DB_SERVICE_NAME || 'LOG660',
  username: process.env.DB_USERNAME, // EQUIPEXX
  password: process.env.DB_PASSWORD,
  schema: process.env.DB_SID, // EQUIPEXX en majuscules
  synchronize: false, // Important: false pour ne pas modifier votre schéma existant
  // logging: process.env.NODE_ENV === 'development',
  logging: true,
  entities: [
    Personne,
    ProfilClient,
    ProfilEmploye,
    Forfait,
    Film,
    Genre,
    Langue,
    Pays,
    Copie,
    Location,
    LocationCopie,
    Adresse,
    FichePersonne,
  ],
});
