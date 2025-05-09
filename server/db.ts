import * as mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// Parse the DATABASE_URL for MariaDB connection
const getDatabaseConfig = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  try {
    const params = new URL(url);
    return {
      host: params.hostname,
      port: parseInt(params.port, 10) || 3306,
      user: params.username,
      password: params.password,
      database: params.pathname.substring(1),
      ssl: params.searchParams.get('ssl') === 'true' ? {
        rejectUnauthorized: false
      } : undefined
    };
  } catch (error) {
    console.error("Failed to parse DATABASE_URL:", error);
    throw new Error("Invalid DATABASE_URL format");
  }
};

// Create connection pool
export const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema, mode: 'default' });