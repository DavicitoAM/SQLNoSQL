import { syncMongoFromMysql } from '../services/mongoSyncService.js';
import { closeMongo } from '../config/mongodb.js';
import { mysqlPool } from '../config/mysql.js';

async function main() {
  console.log('Transformando datos relacionales a documentos MongoDB...');
  const counts = await syncMongoFromMysql();
  console.log(`Listo: ${counts.books} libros, ${counts.users} usuarios y ${counts.loans} préstamos sincronizados.`);
}

main()
  .catch((error) => {
    console.error('No se pudo sincronizar MongoDB:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongo();
    await mysqlPool.end();
  });
