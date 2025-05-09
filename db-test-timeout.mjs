import * as mysql from 'mysql2/promise';

async function testConnection() {
  // Parse the DATABASE_URL
  const getDatabaseConfig = () => {
    const url = process.env.DATABASE_URL;
    
    if (!url) {
      throw new Error("DATABASE_URL must be set.");
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
        } : undefined,
        connectTimeout: 5000, // 5 seconds timeout
        connectionLimit: 1
      };
    } catch (error) {
      console.error("Failed to parse DATABASE_URL:", error);
      throw new Error("Invalid DATABASE_URL format");
    }
  };

  try {
    console.log("Connecting to database...");
    const config = getDatabaseConfig();
    console.log("Database config:", {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      ssl: config.ssl ? 'Enabled' : 'Disabled',
      connectTimeout: config.connectTimeout
    });
    
    // Create connection
    console.log("Creating connection pool...");
    const pool = mysql.createPool(config);
    console.log("Pool created. Testing connection...");
    
    // Test query with timeout
    const connectionPromise = pool.execute('SELECT 1');
    
    // Set a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timed out after 5 seconds')), 5000);
    });
    
    // Race the connection against the timeout
    const [rows] = await Promise.race([connectionPromise, timeoutPromise]);
    console.log("Connection test successful:", rows);
    
    // Try to show tables
    console.log("Querying tables...");
    const [tablesResult] = await pool.execute('SHOW TABLES;');
    console.log("Tables in database:", tablesResult);
    
    // Close pool
    await pool.end();
    console.log("Connection closed.");
  } catch (error) {
    console.error("Connection Error:", error);
    
    // Check if it's a Connection refused error
    if (error.code === 'ECONNREFUSED') {
      console.error("Cannot connect to the database server. Please check if:");
      console.error("1. The database server is running");
      console.error("2. The connection details (host, port) are correct");
      console.error("3. Your network can reach the database server");
    }
    
    // Check if it's a Authentication error
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("Authentication failed. Please check if:");
      console.error("1. The username is correct");
      console.error("2. The password is correct");
    }
    
    // Check if it's a Database not found error
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error("Database not found. Please check if:");
      console.error("1. The database name is correct");
      console.error("2. The database exists on the server");
    }
  }
}

testConnection();