// /app/api/films/meta/route.ts
import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/data-source';
import { Genre } from '@/entities/Genre';
import { Pays } from '@/entities/Pays';
import { Film } from '@/entities/Film';

export async function GET() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ DataSource initialisé');
        }

        const genreRepo = AppDataSource.getRepository(Genre);
        const paysRepo = AppDataSource.getRepository(Pays);
        const filmRepo = AppDataSource.getRepository(Film);

        const genres = await genreRepo.find({
            select: ['nom'],
            order: { nom: 'ASC' }
        });

        const countries = await paysRepo.find({
            select: ['nom'],
            order: { nom: 'ASC' }
        });

        const rawLanguages = await filmRepo
            .createQueryBuilder('film')
            .select('film.langueOriginale', 'language')
            .distinct(true)
            .orderBy('film.langueOriginale', 'ASC')
            .getRawMany();

        const languages = rawLanguages
            .map(item => item.language)
            .filter(Boolean);

        return NextResponse.json({
            genres: genres.map(g => g.nom),
            countries: countries.map(p => p.nom),
            languages: languages
        });

    } catch (error) {
        console.error('❌ Erreur de connexion:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            config: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                serviceName: process.env.DB_SERVICE_NAME,
                username: process.env.DB_USERNAME,
                schema: process.env.DB_SCHEMA,
            }
        }, { status: 500 });
    }
}