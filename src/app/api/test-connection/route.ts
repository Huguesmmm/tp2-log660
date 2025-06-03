import { NextResponse } from 'next/server';
import { AppDataSource } from '@/lib/data-source';

export async function GET() {
  try {
    console.log('🔄 Tentative de connexion à Oracle...');
    
    // Vérifier les variables d'environnement
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      serviceName: process.env.DB_SERVICE_NAME,
      username: process.env.DB_USERNAME,
      schema: process.env.DB_SID,
      // On ne log pas le password pour des raisons de sécurité
    };
    
    console.log('📋 Configuration DB:', dbConfig);

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ DataSource initialisé');
    }

    // Test simple avec une requête SQL directe
    const result = await AppDataSource.query('SELECT 1 FROM DUAL');
    console.log('✅ Requête test réussie:', result);

    // Test pour voir les tables de votre schéma
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM user_tables 
      ORDER BY table_name
    `);
    console.log('📊 Tables trouvées:', tables);

    return NextResponse.json({
      success: true,
      message: 'Connexion Oracle réussie!',
      config: dbConfig,
      testQuery: result,
      tablesCount: tables.length,
      tables: tables.slice(0, 10) // Premières 10 tables
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
