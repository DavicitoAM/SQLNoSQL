import 'dotenv/config';

function numberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

export const env = {
  port: numberEnv('PORT', 3001),
  mysql: {
    host: process.env.MYSQL_HOST ?? '127.0.0.1',
    port: numberEnv('MYSQL_PORT', 3306),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'biblioteca_comparativa'
  },
  mongo: {
    uri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017',
    database: process.env.MONGODB_DATABASE ?? 'biblioteca_documental'
  }
};
