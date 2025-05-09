import * as mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MariaDB connection configuration
const dbConfig = {
  host: 'cloud-2.hoster.kz',
  port: 8443,
  user: 'p-345418_artline',
  password: '9#X3f8w9q',
  database: 'p-345418_artline',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add SSL settings if required by your hosting provider
  ssl: {
    rejectUnauthorized: false
  }
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema, mode: 'default' });