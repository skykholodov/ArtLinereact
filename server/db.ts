import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGHOST || !process.env.PGPORT || !process.env.PGDATABASE) {
  throw new Error(
    "Database environment variables must be set. Did you forget to provision a database?",
  );
}

// Создаем конфигурацию подключения на основе переменных окружения
export const pool = createPool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: Number(process.env.PGPORT),
  // SSL отключим для локальной разработки
  ssl: process.env.NODE_ENV === 'production' ? {} : undefined
});

// Инициализируем Drizzle ORM
export const db = drizzle(pool, { schema, mode: 'default' });

// Экспортируем функцию для получения результата запроса в формате MySQL
export function getResultSetHeader(result: any): { 
  insertId: number; 
  affectedRows: number 
} {
  // Для MySQL результат уже должен содержать эти свойства
  return {
    insertId: Number(result.insertId || 0),
    affectedRows: Number(result.affectedRows || 0)
  };
}
