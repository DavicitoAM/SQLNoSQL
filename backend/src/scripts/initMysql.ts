import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const schemaPath = new URL('../../../database/mysql/schema.sql', import.meta.url);
const seedsPath = new URL('../../../database/mysql/seeds.sql', import.meta.url);

async function main() {
  const [schema, seeds] = await Promise.all([
    readFile(schemaPath, 'utf8'),
    readFile(seedsPath, 'utf8')
  ]);

  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    console.log('Creando estructura MySQL...');
    await connection.query(schema);
    console.log('Insertando datos iniciales...');
    await connection.query(seeds);
    console.log(`Listo: base ${env.mysql.database} preparada.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('No se pudo inicializar MySQL:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
