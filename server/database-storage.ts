import { 
  users, type User, type InsertUser,
  contents, type Content, type InsertContent,
  contentRevisions, type ContentRevision, type InsertContentRevision,
  media, type Media, type InsertMedia,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import type { JsonValue } from 'type-fest';
import session from "express-session";
import createMemoryStore from "memorystore";
import { IStorage } from "./storage";
import { createHash } from "crypto";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Create memory session store for MariaDB
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Create default admin user if none exists
    this.getUserByUsername("admin").then(existingUser => {
      if (!existingUser) {
        this.createUser({
          username: "admin",
          password: "password", // Simple password for testing
          name: "Administrator",
          isAdmin: true
        }).then(user => {
          console.log("Default admin user created with ID:", user.id);
          // Initialize demo content
          this.initDemoContent(user.id);
        }).catch(err => {
          console.error("Error creating default admin user:", err);
        });
      }
    }).catch(err => {
      console.error("Error checking for admin user:", err);
    });
  }

  // Helper to hash passwords
  private async hashPassword(password: string): Promise<string> {
    return createHash('sha256').update(password).digest('hex');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await this.hashPassword(insertUser.password);
    
    // Insert user with MySQL and get the insert ID
    const [insertResult] = await pool.execute(
      'INSERT INTO users (username, password, name, is_admin) VALUES (?, ?, ?, ?)',
      [
        insertUser.username,
        hashedPassword,
        insertUser.name || null,
        insertUser.isAdmin || false
      ]
    );
    
    // MySQL result contains insertId
    const insertId = (insertResult as any).insertId;
    if (!insertId) {
      throw new Error("Failed to insert user");
    }
    
    // Get the created user by ID
    const user = await this.getUser(Number(insertId));
    if (!user) {
      throw new Error("User created but could not be retrieved");
    }
    
    return user;
  }

  // Content operations
  async getContent(sectionType: string, sectionKey: string, language: string): Promise<Content | undefined> {
    const result = await db
      .select()
      .from(contents)
      .where(
        and(
          eq(contents.sectionType, sectionType),
          eq(contents.sectionKey, sectionKey),
          eq(contents.language, language)
        )
      );
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getAllContentBySectionType(sectionType: string): Promise<Content[]> {
    return db
      .select()
      .from(contents)
      .where(eq(contents.sectionType, sectionType));
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    // Check if content exists
    if (insertContent.sectionType && insertContent.sectionKey && insertContent.language) {
      const existingContent = await this.getContent(
        insertContent.sectionType,
        insertContent.sectionKey,
        insertContent.language
      );

      if (existingContent) {
        // Create revision of the existing content before updating
        await this.createContentRevision({
          contentId: existingContent.id,
          content: existingContent.content as JsonValue,
          createdBy: insertContent.updatedBy
        });

        // Update the existing content
        const updatedContent = await this.updateContent(existingContent.id, {
          content: insertContent.content,
          updatedAt: new Date(),
          updatedBy: insertContent.updatedBy
        });
        
        if (!updatedContent) {
          throw new Error("Failed to update content");
        }
        
        return updatedContent;
      }
    }

    // Create new content with direct MySQL query
    const now = new Date();
    const contentJson = JSON.stringify(insertContent.content);
    
    const [insertResult] = await pool.execute(
      'INSERT INTO contents (section_type, section_key, language, content, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        insertContent.sectionType,
        insertContent.sectionKey,
        insertContent.language || 'ru',
        contentJson,
        now,
        now,
        insertContent.createdBy,
        insertContent.updatedBy
      ]
    );
    
    // MySQL result contains insertId
    const insertId = (insertResult as any).insertId;
    if (!insertId) {
      throw new Error("Failed to insert content");
    }
    
    // Get the created content by ID
    const content = await db
      .select()
      .from(contents)
      .where(eq(contents.id, Number(insertId)));
    
    if (!content || content.length === 0) {
      throw new Error("Content created but could not be retrieved");
    }
    
    return content[0];
  }

  async updateContent(id: number, updatedFields: Partial<Content>): Promise<Content | undefined> {
    await db
      .update(contents)
      .set(updatedFields)
      .where(eq(contents.id, id));
    
    // Get the updated content
    const result = await db
      .select()
      .from(contents)
      .where(eq(contents.id, id));
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Content revision operations
  async getContentRevisions(contentId: number): Promise<ContentRevision[]> {
    return db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.contentId, contentId))
      .orderBy(desc(contentRevisions.createdAt))
      .limit(5); // Keep only the 5 most recent revisions
  }

  async getContentRevisionsByCriteria(sectionType: string, sectionKey: string, language: string): Promise<ContentRevision[]> {
    const content = await this.getContent(sectionType, sectionKey, language);
    if (!content) return [];
    return this.getContentRevisions(content.id);
  }

  async createContentRevision(insertRevision: InsertContentRevision): Promise<ContentRevision> {
    const now = new Date();
    const contentJson = JSON.stringify(insertRevision.content);
    
    // Insert with direct MySQL query
    const [insertResult] = await pool.execute(
      'INSERT INTO content_revisions (content_id, content, created_at, created_by) VALUES (?, ?, ?, ?)',
      [
        insertRevision.contentId,
        contentJson,
        now,
        insertRevision.createdBy
      ]
    );
    
    // MySQL result contains insertId
    const insertId = (insertResult as any).insertId;
    if (!insertId) {
      throw new Error("Failed to insert content revision");
    }
    
    // Get the created revision by ID
    const revision = await db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.id, Number(insertId)));
    
    if (!revision || revision.length === 0) {
      throw new Error("Content revision created but could not be retrieved");
    }
    
    return revision[0];
  }

  async getContentRevision(id: number): Promise<ContentRevision | undefined> {
    const result = await db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.id, id));
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Media operations
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const now = new Date();
    
    // Insert with direct MySQL query
    const [insertResult] = await pool.execute(
      'INSERT INTO media (filename, original_name, mime_type, size, path, category, uploaded_at, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        insertMedia.filename,
        insertMedia.originalName,
        insertMedia.mimeType,
        insertMedia.size,
        insertMedia.path,
        insertMedia.category || null,
        now,
        insertMedia.uploadedBy
      ]
    );
    
    // MySQL result contains insertId
    const insertId = (insertResult as any).insertId;
    if (!insertId) {
      throw new Error("Failed to insert media");
    }
    
    // Get the created media by ID
    const mediaItem = await db
      .select()
      .from(media)
      .where(eq(media.id, Number(insertId)));
    
    if (!mediaItem || mediaItem.length === 0) {
      throw new Error("Media created but could not be retrieved");
    }
    
    return mediaItem[0];
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id));
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getMediaByCategory(category: string): Promise<Media[]> {
    return db
      .select()
      .from(media)
      .where(eq(media.category, category))
      .orderBy(desc(media.uploadedAt));
  }

  async deleteMedia(id: number): Promise<boolean> {
    await db
      .delete(media)
      .where(eq(media.id, id));
    
    // Check if the media still exists to determine if deletion was successful
    const result = await db
      .select()
      .from(media)
      .where(eq(media.id, id));
    
    return result.length === 0;
  }

  async getAllMedia(): Promise<Media[]> {
    return db
      .select()
      .from(media)
      .orderBy(desc(media.uploadedAt));
  }

  // Contact submission operations
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const now = new Date();
    
    // Insert with direct MySQL query
    const [insertResult] = await pool.execute(
      'INSERT INTO contact_submissions (name, phone, email, service, message, created_at, processed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        insertSubmission.name,
        insertSubmission.phone,
        insertSubmission.email || null,
        insertSubmission.service || null,
        insertSubmission.message || null,
        now,
        false
      ]
    );
    
    // MySQL result contains insertId
    const insertId = (insertResult as any).insertId;
    if (!insertId) {
      throw new Error("Failed to insert contact submission");
    }
    
    // Get the created submission by ID
    const submission = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, Number(insertId)));
    
    if (!submission || submission.length === 0) {
      throw new Error("Contact submission created but could not be retrieved");
    }
    
    return submission[0];
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const result = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    
    return result.length > 0 ? result[0] : undefined;
  }

  async updateContactSubmission(id: number, data: Partial<ContactSubmission>): Promise<ContactSubmission | undefined> {
    await db
      .update(contactSubmissions)
      .set(data)
      .where(eq(contactSubmissions.id, id));
    
    // Get the updated submission
    return this.getContactSubmission(id);
  }

  // Stats operations
  async countContentBySection(sectionType: string): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(contents)
      .where(eq(contents.sectionType, sectionType));
    
    return Number(result[0].count) || 0;
  }

  async countContentByLanguage(language: string): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(contents)
      .where(eq(contents.language, language));
    
    return Number(result[0].count) || 0;
  }

  async countAllContent(): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(contents);
    
    return Number(result[0].count) || 0;
  }

  async countMedia(): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(media);
    
    return Number(result[0].count) || 0;
  }

  async countContentRevisions(): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(contentRevisions);
    
    return Number(result[0].count) || 0;
  }

  async countContactSubmissions(): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(contactSubmissions);
    
    return Number(result[0].count) || 0;
  }

  // Demo content initialization
  async initDemoContent(userId: number): Promise<void> {
    try {
      console.log("Initializing demo content...");

      // Create testimonials for Russian language
      await this.createContent({
        sectionType: "testimonials",
        sectionKey: "items",
        language: "ru",
        content: {
          items: [
            {
              id: 1,
              text: "Работаем с Art-Line уже третий год — от визиток до брендирования автомобилей. Всегда чётко, быстро и со вкусом. Особенно радует подход к деталям: всё продумано, ничего лишнего. Рекомендуем всем, кто ценит профессионализм!",
              author: "Арт Директор",
              position: "корпоративный клиент",
              rating: 5
            },
            {
              id: 2,
              text: "Заказывал разработку дизайна для вывески. Ребята очень креативные, предложили несколько интересных идей. Вывеска получилась просто отличная!",
              author: "Бакытжан",
              position: "Разработка дизайна вывески",
              rating: 5
            },
            {
              id: 3,
              text: "Очень доволен работой агентства. Быстро и профессионально сделали брендирование автомобиля. Рекомендую!",
              author: "Сергей",
              position: "Брендирование автомобиля",
              rating: 5
            },
            {
              id: 4,
              text: "Агентство помогло с оформлением мероприятия. Все было сделано оперативно и качественно. Очень благодарна за их профессионализм!",
              author: "Елена",
              position: "Оформление мероприятия",
              rating: 5
            }
          ]
        },
        createdBy: userId,
        updatedBy: userId
      });

      // Create testimonials for Kazakh language
      await this.createContent({
        sectionType: "testimonials",
        sectionKey: "items",
        language: "kz",
        content: {
          items: [
            {
              id: 1,
              text: "Art-Line-мен үшінші жыл жұмыс істеп келеміз — визиткалардан бастап автомобильдерді брендтеуге дейін. Әрқашан анық, жылдам және талғаммен. Әсіресе егжей-тегжейлі тәсіл қуантады: барлығы ойластырылған, артық ештеңе жоқ. Кәсібилікті бағалайтын барлық адамдарға ұсынамыз!",
              author: "Арт Директор",
              position: "корпоративтік клиент",
              rating: 5
            },
            {
              id: 2,
              text: "Маңдайша үшін дизайн әзірлеуге тапсырыс бердім. Жігіттер өте креативті, бірнеше қызықты идеялар ұсынды. Маңдайша керемет шықты!",
              author: "Бакытжан",
              position: "Маңдайша дизайнын әзірлеу",
              rating: 5
            },
            {
              id: 3,
              text: "Агенттіктің жұмысына өте ризамын. Автокөлікті брендтеуді жылдам және кәсіби түрде жасады. Ұсынамын!",
              author: "Сергей",
              position: "Автомобильді брендтеу",
              rating: 5
            },
            {
              id: 4,
              text: "Агенттік іс-шараны безендіруге көмектесті. Барлығы жедел және сапалы жасалды. Олардың кәсібилігі үшін өте ризамын!",
              author: "Елена",
              position: "Іс-шараны безендіру",
              rating: 5
            }
          ]
        },
        createdBy: userId,
        updatedBy: userId
      });

      // Create testimonials for English language
      await this.createContent({
        sectionType: "testimonials",
        sectionKey: "items",
        language: "en",
        content: {
          items: [
            {
              id: 1,
              text: "We've been working with Art-Line for the third year now - from business cards to vehicle branding. Always precise, fast, and tasteful. The approach to details is especially pleasing: everything is thought out, nothing excessive. We recommend to everyone who values professionalism!",
              author: "Art Director",
              position: "corporate client",
              rating: 5
            },
            {
              id: 2,
              text: "I ordered a design development for a signage. The team is very creative, they offered several interesting ideas. The sign turned out great!",
              author: "Bakytzhan",
              position: "Signage design development",
              rating: 5
            },
            {
              id: 3,
              text: "Very satisfied with the agency's work. They branded the car quickly and professionally. I recommend!",
              author: "Sergey",
              position: "Vehicle branding",
              rating: 5
            },
            {
              id: 4,
              text: "The agency helped with the event decoration. Everything was done promptly and with quality. Very grateful for their professionalism!",
              author: "Elena",
              position: "Event decoration",
              rating: 5
            }
          ]
        },
        createdBy: userId,
        updatedBy: userId
      });

      console.log("Demo content initialized successfully");
    } catch (error) {
      console.error("Error initializing demo content:", error);
    }
  }
}