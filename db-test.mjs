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
        } : undefined
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
      ssl: config.ssl ? 'Enabled' : 'Disabled'
    });
    
    // Create connection
    const connection = await mysql.createConnection(config);
    console.log("Connection established successfully.");
    
    // Test query
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log("Tables in database:", rows);
    
    // Close connection
    await connection.end();
    console.log("Connection closed.");
  } catch (error) {
    console.error("Error:", error);
  }
}

testConnection();