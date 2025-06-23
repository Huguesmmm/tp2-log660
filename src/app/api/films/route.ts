import {NextRequest, NextResponse} from 'next/server';
import {AppDataSource} from '@/lib/data-source';
import {Film} from '@/entities/Film';
import {Brackets} from 'typeorm';

export async function GET(req: NextRequest) {
    try {
        const p = req.nextUrl.searchParams;

        const titres = p.getAll('titre');
        const anneeMin = p.get('anneeMin');
        const anneeMax = p.get('anneeMax');
        const pays = p.getAll('pays');
        const language = p.getAll('language');
        const genres = p.getAll('genre');
        const realisateurs = p.getAll('realisateur');
        const acteurs = p.getAll('acteur');

        const skip = Number(p.get('skip') ?? '0');
        const take = Number(p.get('take') ?? '50');

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ DataSource initialisé');
        }

        const qb = AppDataSource
            .getRepository(Film)
            .createQueryBuilder('f')
            .distinct(true);

        // Titre
        if (titres.length > 0) {
            qb.andWhere(new Brackets(sub => {
                titres.forEach((t, i) => {
                    sub.orWhere(`LOWER(f.titre) LIKE :titre${i}`, {[`titre${i}`]: `%${t.toLowerCase()}%`});
                });
            }));
        }

        // Annee
        if (anneeMin) {
            qb.andWhere('f.anneeSortie >= :anneeMin', {anneeMin: Number(anneeMin)});
        }
        if (anneeMax) {
            qb.andWhere('f.anneeSortie <= :anneeMax', {anneeMax: Number(anneeMax)});
        }

        // Language
        if (language.length > 0) {
            qb.andWhere(new Brackets(sub => {
                language.forEach((l, i) => {
                    sub.orWhere(`LOWER(f.langueOriginale) LIKE :langue${i}`, {[`langue${i}`]: `%${l.toLowerCase()}%`});
                });
            }));
        }

        // Pays
        if (pays.length > 0) {
            qb.innerJoin('f.pays', 'p');
            qb.andWhere(new Brackets(sub => {
                pays.forEach((p, i) => {
                    sub.orWhere(`LOWER(p.nom) LIKE :paysNom${i}`, {[`paysNom${i}`]: `%${p.toLowerCase()}%`});
                });
            }));
        }

        // Genre
        if (genres.length > 0) {
            qb.innerJoin('f.genres', 'g');
            qb.andWhere(new Brackets(sub => {
                genres.forEach((g, i) => {
                    sub.orWhere(`LOWER(g.nom) LIKE :genNom${i}`, {[`genNom${i}`]: `%${g.toLowerCase()}%`});
                });
            }));
        }

        // Realisateur
        if (realisateurs.length > 0) {
            qb.innerJoin('f.realisateurs', 'r');
            qb.andWhere(new Brackets(sub => {
                realisateurs.forEach((r, i) => {
                    sub.orWhere(`LOWER(r.nom) LIKE :reaNom${i}`, {[`reaNom${i}`]: `%${r.toLowerCase()}%`});
                });
            }));
        }

        // Acteur
        if (acteurs.length > 0) {
            qb.innerJoin('f.acteurs', 'fa')
                .innerJoin('fa.artiste', 'act');
            qb.andWhere(new Brackets(sub => {
                acteurs.forEach((a, i) => {
                    sub.orWhere(`LOWER(act.nom) LIKE :actNom${i}`, {[`actNom${i}`]: `%${a.toLowerCase()}%`});
                });
            }));
        }

        const films = await qb
            .select([
                'f.filmId',
                'f.titre',
                'f.anneeSortie',
            ])
            .orderBy('f.anneeSortie', 'DESC')
            .addOrderBy('f.filmId', 'DESC')
            .skip(skip)
            .take(take)
            .getMany()

        return NextResponse.json({data: films});

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
