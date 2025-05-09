// Simple script to test database connection
import { pool } from './server/db.ts';
import createTables from './server/create-tables.ts';

console.log('Testing database connection to MariaDB...');

async function testConnection() {
  try {
    console.log('Connecting to MariaDB...');
    const connection = await pool.getConnection();
    console.log('Connected successfully to MariaDB!');
    
    // Initialize tables
    console.log('Creating tables if they do not exist...');
    await createTables();
    console.log('Tables created or already exist.');
    
    // Test query
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Available tables:');
    console.log(rows);
    
    connection.release();
    console.log('Connection released.');
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  } finally {
    try {
      await pool.end();
      console.log('Pool ended.');
    } catch (err) {
      console.error('Error closing pool:', err);
    }
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('Database test completed successfully!');
      process.exit(0);
    } else {
      console.error('Database test failed.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });