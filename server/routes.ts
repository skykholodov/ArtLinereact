import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  getContent,
  saveContent, 
  getContentRevisions, 
  restoreContentRevision 
} from "./controllers/content";
import { uploadFiles, getMedia, deleteMedia } from "./controllers/upload";
import { sendAdminNotification, sendUserConfirmation } from "./services/email";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer storage
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename using timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Create multer upload instance with file size limits
const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Admin access middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Content routes
  app.get("/api/content", getContent);
  app.post("/api/content", isAuthenticated, saveContent);
  app.get("/api/content/revisions", isAuthenticated, getContentRevisions);
  app.post("/api/content/restore/:revisionId", isAuthenticated, restoreContentRevision);

  // Media routes
  app.post("/api/upload", isAuthenticated, upload.array("files", 10), uploadFiles);
  app.get("/api/media", getMedia);
  app.delete("/api/media/:id", isAuthenticated, deleteMedia);

  // Stats API
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        sections: {
          hero: await storage.countContentBySection("hero"),
          services: await storage.countContentBySection("services"),
          portfolio: await storage.countContentBySection("portfolio"),
          about: await storage.countContentBySection("about"),
          testimonials: await storage.countContentBySection("testimonials")
        },
        contentEntries: await storage.countAllContent(),
        mediaFiles: await storage.countMedia(),
        contentRevisions: await storage.countContentRevisions(),
        contactSubmissions: await storage.countContactSubmissions(),
        languages: {
          ru: await storage.countContentByLanguage("ru"),
          kz: await storage.countContentByLanguage("kz"),
          en: await storage.countContentByLanguage("en")
        }
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Contact submission route
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, phone, email, service, message } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
      }
      
      const submission = await storage.createContactSubmission({
        name,
        phone,
        email: email || "",
        service: service || "",
        message: message || ""
      });
      
      // Отправка уведомления администратору
      sendAdminNotification(submission)
        .then(sent => {
          console.log(`Admin notification ${sent ? 'sent' : 'failed'} for submission ID: ${submission.id}`);
        })
        .catch(err => {
          console.error('Error sending admin notification:', err);
        });
      
      // Отправка подтверждения пользователю, если указан email
      if (email) {
        sendUserConfirmation(submission)
          .then(sent => {
            console.log(`User confirmation ${sent ? 'sent' : 'failed'} for submission ID: ${submission.id}`);
          })
          .catch(err => {
            console.error('Error sending user confirmation:', err);
          });
      }
      
      res.status(201).json(submission);
    } catch (error) {
      console.error("Error creating contact submission:", error);
      res.status(500).json({ message: "Error creating contact submission" });
    }
  });

  // Get contact submissions (admin only)
  app.get("/api/contact", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Error fetching contact submissions" });
    }
  });

  // Mark contact submission as processed (admin only)
  app.patch("/api/contact/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { processed } = req.body;
      
      if (typeof processed !== 'boolean') {
        return res.status(400).json({ message: "Processed field is required and must be a boolean" });
      }
      
      const submission = await storage.updateContactSubmission(id, { processed });
      
      if (!submission) {
        return res.status(404).json({ message: "Contact submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error updating contact submission:", error);
      res.status(500).json({ message: "Error updating contact submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
