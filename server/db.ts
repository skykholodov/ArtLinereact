import { createPool } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// В режиме разработки используем MemStorage вместо подключения к базе данных
const isDevelopment = process.env.NODE_ENV === 'development';

// Интерфейс для результата MySQL запроса
interface ResultSetHeader {
  insertId: number;
  affectedRows: number;
}

// Функция для эмуляции результатов запросов MySQL
export function getResultSetHeader(result: any): ResultSetHeader {
  // Для MySQL результат уже должен содержать эти свойства
  return {
    insertId: Number(result?.insertId || 0),
    affectedRows: Number(result?.affectedRows || isDevelopment ? 1 : 0) // В режиме разработки всегда успех
  };
}

let pool: any;
let db: any;

if (isDevelopment) {
  console.log('Running in development mode with in-memory storage');
  // Создаем заглушки для пула соединений и db
  pool = {} as any;
  db = {} as any;
} else {
  // Режим production с настоящей базой данных
  if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGHOST || !process.env.PGPORT || !process.env.PGDATABASE) {
    throw new Error(
      "Database environment variables must be set. Did you forget to provision a database?",
    );
  }

  // Создаем конфигурацию подключения на основе переменных окружения
  pool = createPool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT),
    // Увеличиваем таймауты для лучшей стабильности
    connectTimeout: 30000, // 30 секунд на соединение
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL отключим для локальной разработки
    ssl: process.env.NODE_ENV === 'production' ? {} : undefined
  });

  // Инициализируем Drizzle ORM
  db = drizzle(pool, { schema, mode: 'default' });
}

export { pool, db };
