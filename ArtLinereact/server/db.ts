import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Интерфейс для результата DB запроса
interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

// Функция для получения результата запроса
export function getResultSetHeader(result: any): ResultSetHeader {
  // Для PostgreSQL вернем ID добавленной записи из rowCount или rows[0].id
  return {
    insertId: result?.rows?.[0]?.id || 0,
    affectedRows: result?.rowCount || 0
  };
}

// Создаем пул соединений для PostgreSQL используя DATABASE_URL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : undefined
});

export const db = drizzle(pool, { schema });
