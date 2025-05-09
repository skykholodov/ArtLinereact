// Simple script to start the application
import express from 'express';
import { registerRoutes } from './server/routes.js';
import { setupVite, serveStatic, log } from './server/vite.js';
import createTables from './server/create-tables.js';

// Create express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize database tables
createTables()
  .then(() => {
    log('Database tables initialized successfully');
  })
  .catch((err) => {
    log('Failed to initialize database tables: ' + err.message);
  });

// Log middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Start the server
async function startServer() {
  try {
    const server = await registerRoutes(app);

    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error(err);
    });

    // Setup Vite or serve static files
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start listening
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server started and listening on port ${port}`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Run the server
startServer()
  .then(server => {
    console.log('Server started successfully');
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });