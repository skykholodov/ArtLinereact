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
import { bulkImport } from "./controllers/bulk-import";
import { sendAdminNotification, sendUserConfirmation } from "./services/email";
import { translateText, translateContent, detectLanguage } from "./services/translation";
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
  
  // Массовый импорт контента
  app.post("/api/bulk-import", isAuthenticated, bulkImport);

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
      
      // Отправка уведомлений асинхронно, чтобы не задерживать ответ
      Promise.all([
        // Уведомление администратору
        sendAdminNotification(submission)
          .then(sent => {
            console.log(`Admin notification ${sent ? 'sent' : 'failed'} for submission ID: ${submission.id}`);
            return sent;
          })
          .catch(err => {
            console.error('Error sending admin notification:', err);
            return false;
          }),
          
        // Подтверждение пользователю (если указан email)
        email ? 
          sendUserConfirmation(submission)
            .then(sent => {
              console.log(`User confirmation ${sent ? 'sent' : 'failed'} for submission ID: ${submission.id}`);
              return sent;
            })
            .catch(err => {
              console.error('Error sending user confirmation:', err);
              return false;
            })
          : Promise.resolve(false)
      ]).then(([adminSent, userSent]) => {
        console.log(`Email notifications result: Admin=${adminSent}, User=${userSent}`);
      });
      
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
  
  // Portfolio API - получаем элементы портфолио
  app.get("/api/portfolio", async (req, res) => {
    try {
      // Получаем содержимое портфолио из хранилища
      const portfolioContent = await storage.getContent("portfolio", "items", req.query.language as string || "ru");
      
      // Если контент не найден, возвращаем пустой массив
      if (!portfolioContent) {
        return res.json([]);
      }
      
      // Если контент найден и он содержит элементы в поле content, возвращаем их
      try {
        const portfolioItems = Array.isArray(portfolioContent.content) 
          ? portfolioContent.content 
          : JSON.parse(portfolioContent.content as string);
        
        return res.json(portfolioItems);
      } catch (parseError) {
        console.error("Error parsing portfolio content:", parseError);
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching portfolio items:", error);
      res.status(500).json({ message: "Error fetching portfolio items" });
    }
  });
  
  // Testimonials API - получаем отзывы
  app.get("/api/testimonials", async (req, res) => {
    try {
      // Получаем отзывы из хранилища
      const testimonialContent = await storage.getContent("testimonials", "items", req.query.language as string || "ru");
      
      // Если контент не найден, возвращаем пустой массив
      if (!testimonialContent) {
        return res.json([]);
      }
      
      // Если контент найден, обрабатываем и возвращаем элементы
      try {
        let testimonialItems = [];
        
        // Проверяем тип содержимого
        if (Array.isArray(testimonialContent.content)) {
          // Если это массив, используем его напрямую
          testimonialItems = testimonialContent.content;
        } else if (typeof testimonialContent.content === 'object' && testimonialContent.content !== null) {
          // Если это объект (что вероятно для PostgreSQL jsonb), проверяем наличие свойства items
          if (testimonialContent.content.items && Array.isArray(testimonialContent.content.items)) {
            testimonialItems = testimonialContent.content.items;
          } else {
            // Если объект, но без items, используем сам объект
            testimonialItems = [testimonialContent.content];
          }
        } else if (typeof testimonialContent.content === 'string') {
          // Если это строка, пытаемся распарсить как JSON
          try {
            const parsed = JSON.parse(testimonialContent.content);
            if (Array.isArray(parsed)) {
              testimonialItems = parsed;
            } else if (parsed.items && Array.isArray(parsed.items)) {
              testimonialItems = parsed.items;
            } else {
              testimonialItems = [parsed];
            }
          } catch (e) {
            console.error("Error parsing testimonial content as JSON string:", e);
            testimonialItems = [];
          }
        }
        
        return res.json(testimonialItems);
      } catch (parseError) {
        console.error("Error processing testimonial content:", parseError);
        return res.json([]);
      }
    } catch (error) {
      console.error("Error fetching testimonial items:", error);
      res.status(500).json({ message: "Error fetching testimonial items" });
    }
  });

  // API для перевода отдельного текста
  app.post("/api/translate/text", isAuthenticated, async (req, res) => {
    try {
      const { text, targetLang, sourceLang = "ru" } = req.body;
      
      if (!text || !targetLang) {
        return res.status(400).json({ message: "Text and target language are required" });
      }
      
      if (!["ru", "kz", "en"].includes(targetLang)) {
        return res.status(400).json({ message: "Invalid target language. Supported: ru, kz, en" });
      }
      
      const translatedText = await translateText(text, targetLang, sourceLang);
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).json({ message: "Error translating text" });
    }
  });
  
  // API для автоматического перевода контента при сохранении
  app.post("/api/translate/content", isAuthenticated, async (req, res) => {
    try {
      const { content, fields, sourceLang = "ru" } = req.body;
      
      if (!content || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ message: "Content object and fields array are required" });
      }
      
      const translations = await translateContent(content, fields, sourceLang);
      res.json(translations);
    } catch (error) {
      console.error("Error translating content:", error);
      res.status(500).json({ message: "Error translating content" });
    }
  });
  
  // API для определения языка текста
  app.post("/api/detect-language", isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const language = await detectLanguage(text);
      res.json({ language });
    } catch (error) {
      console.error("Error detecting language:", error);
      res.status(500).json({ message: "Error detecting language" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
