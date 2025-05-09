import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: "ok", 
      message: "ArtLineReact Setup Guide API is running" 
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
