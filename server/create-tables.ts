import { pool } from './db';

async function createTables() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating database tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Users table created or exists');

    // Contents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_type VARCHAR(50) NOT NULL,
        section_key VARCHAR(100) NOT NULL,
        language VARCHAR(10) NOT NULL DEFAULT 'ru',
        content JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        updated_by INT NOT NULL,
        INDEX created_by_idx (created_by),
        INDEX updated_by_idx (updated_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Contents table created or exists');

    // Content revisions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS content_revisions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content_id INT NOT NULL,
        content JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INT NOT NULL,
        INDEX content_id_idx (content_id),
        INDEX rev_created_by_idx (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Content revisions table created or exists');

    // Media table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        path VARCHAR(255) NOT NULL,
        category VARCHAR(50) NULL,
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INT NOT NULL,
        INDEX uploaded_by_idx (uploaded_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Media table created or exists');

    // Contact submissions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NULL,
        service VARCHAR(255) NULL,
        message TEXT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN NOT NULL DEFAULT FALSE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Contact submissions table created or exists');

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Execute if this file is run directly
// В ES модулях надо использовать другой метод определения, запускается ли файл напрямую
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  createTables()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to create tables:', error);
      process.exit(1);
    });
}

export default createTables;