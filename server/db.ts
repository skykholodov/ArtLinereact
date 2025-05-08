import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Интерфейс для результата MySQL запроса
interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

// Функция для получения результата запроса
export function getResultSetHeader(result: any): ResultSetHeader {
  return {
    insertId: Number(result?.insertId || 0),
    affectedRows: Number(result?.affectedRows || 1)
  };
}

// Создаем пул соединений для MySQL/MariaDB
// Используем параметры соединения из переменных окружения
const connectionConfig = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
  // Увеличиваем таймауты для лучшей стабильности
  connectTimeout: 30000, // 30 секунд на соединение
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Connecting to database with config:', {
  host: connectionConfig.host,
  user: connectionConfig.user,
  database: connectionConfig.database,
  port: connectionConfig.port
});

export const pool = createPool(connectionConfig);
export const db = drizzle(pool, { schema, mode: 'default' });
