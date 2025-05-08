import { 
  users, type User, type InsertUser,
  contents, type Content, type InsertContent,
  contentRevisions, type ContentRevision, type InsertContentRevision,
  media, type Media, type InsertMedia,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import { IStorage } from "./storage";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import memorystore from "memorystore";

const PgSession = ConnectPgSimple(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // В production используем PgSession для хранения сессий в PostgreSQL
    // В development используем MemoryStore для более быстрой разработки
    if (process.env.NODE_ENV === 'production') {
      try {
        this.sessionStore = new PgSession({
          pool: pool,
          tableName: 'session', // название таблицы для сессий
          createTableIfMissing: true // создать таблицу, если её нет
        });
      } catch (err) {
        console.error('Failed to create PostgreSQL session store:', err);
        // Fallback to memory store if PostgreSQL session fails
        const MemoryStore = memorystore(session);
        this.sessionStore = new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
        });
      }
    } else {
      // В development всегда используем MemoryStore
      const MemoryStore = memorystore(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
    
    // Create default admin user if none exists
    this.getUserByUsername("admin").then(user => {
      if (!user) {
        this.createUser({
          username: "admin",
          password: "$2b$10$9eK/pNuVHqPQ5zvHqCHCGu4mO.vbCTnD7IRyEHr5fFwf.QE5xorSi", // "password" hashed
          name: "Administrator",
          isAdmin: true
        }).then(user => {
          console.log("Default admin user created with ID:", user.id);
        }).catch(err => {
          console.error("Error creating default admin user:", err);
        });
      }
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Content operations
  async getContent(sectionType: string, sectionKey: string, language: string): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(
      and(
        eq(contents.sectionType, sectionType),
        eq(contents.sectionKey, sectionKey),
        eq(contents.language, language)
      )
    );
    return content;
  }

  async getAllContentBySectionType(sectionType: string): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.sectionType, sectionType));
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    // Check if content exists, update if it does
    const existingContent = await this.getContent(
      insertContent.sectionType,
      insertContent.sectionKey,
      insertContent.language || 'ru'
    );

    if (existingContent) {
      // Create revision of the existing content before updating
      await this.createContentRevision({
        contentId: existingContent.id,
        content: existingContent.content,
        createdBy: insertContent.updatedBy || null
      });

      // Update the existing content
      return this.updateContent(existingContent.id, {
        content: insertContent.content,
        updatedAt: new Date(),
        updatedBy: insertContent.updatedBy || null
      }) as Promise<Content>;
    }

    // Create new content
    const [content] = await db.insert(contents).values({
      ...insertContent,
      language: insertContent.language || 'ru',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: insertContent.createdBy || null,
      updatedBy: insertContent.updatedBy || null
    }).returning();
    
    return content;
  }

  async updateContent(id: number, updatedFields: Partial<Content>): Promise<Content | undefined> {
    const [updatedContent] = await db
      .update(contents)
      .set(updatedFields)
      .where(eq(contents.id, id))
      .returning();
    
    return updatedContent;
  }

  // Content revision operations
  async getContentRevisions(contentId: number): Promise<ContentRevision[]> {
    return await db
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
    const [revision] = await db
      .insert(contentRevisions)
      .values({
        ...insertRevision,
        contentId: insertRevision.contentId,
        createdBy: insertRevision.createdBy || null,
        createdAt: new Date()
      })
      .returning();
    
    // Get all revisions for this content
    const revisions = await this.getContentRevisions(insertRevision.contentId);
    
    // If we have more than 5 revisions, delete the oldest ones
    if (revisions.length > 5) {
      const revisionsToKeep = revisions.slice(0, 5);
      
      // Find revisions to delete (all except the 5 most recent)
      const revisionsToDelete = revisions.filter(
        rev => !revisionsToKeep.some(kr => kr.id === rev.id)
      );
      
      // Delete each revision individually
      for (const revToDelete of revisionsToDelete) {
        await db
          .delete(contentRevisions)
          .where(eq(contentRevisions.id, revToDelete.id));
      }
    }
    
    return revision;
  }

  async getContentRevision(id: number): Promise<ContentRevision | undefined> {
    const [revision] = await db
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.id, id));
    
    return revision;
  }

  // Media operations
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db
      .insert(media)
      .values({
        ...insertMedia,
        category: insertMedia.category || null,
        uploadedBy: insertMedia.uploadedBy || null,
        uploadedAt: new Date()
      })
      .returning();
      
    return mediaItem;
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, id));
    
    return mediaItem;
  }

  async getMediaByCategory(category: string): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .where(eq(media.category, category))
      .orderBy(desc(media.uploadedAt));
  }

  async deleteMedia(id: number): Promise<boolean> {
    const result = await db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getAllMedia(): Promise<Media[]> {
    return await db
      .select()
      .from(media)
      .orderBy(desc(media.uploadedAt));
  }

  // Contact submission operations
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values({
        ...insertSubmission,
        email: insertSubmission.email || null,
        message: insertSubmission.message || null,
        service: insertSubmission.service || null,
        createdAt: new Date(),
        processed: false
      })
      .returning();
    
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    const [submission] = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    
    return submission;
  }

  async updateContactSubmission(id: number, data: Partial<ContactSubmission>): Promise<ContactSubmission | undefined> {
    const [updatedSubmission] = await db
      .update(contactSubmissions)
      .set(data)
      .where(eq(contactSubmissions.id, id))
      .returning();
    
    return updatedSubmission;
  }

  // Stats operations
  async countContentBySection(sectionType: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(eq(contents.sectionType, sectionType));
    
    return Number(result[0].count);
  }

  async countContentByLanguage(language: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contents)
      .where(eq(contents.language, language));
    
    return Number(result[0].count);
  }

  async countAllContent(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contents);
    
    return Number(result[0].count);
  }

  async countMedia(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(media);
    
    return Number(result[0].count);
  }

  async countContentRevisions(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contentRevisions);
    
    return Number(result[0].count);
  }

  async countContactSubmissions(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions);
    
    return Number(result[0].count);
  }

  // Инициализация демонстрационного контента
  async initDemoContent(userId: number): Promise<void> {
    try {
      console.log("Initializing demo content for database...");

      // Проверяем, есть ли уже контент
      const contentCount = await this.countAllContent();
      if (contentCount > 0) {
        console.log("Content already exists, skipping demo content initialization");
        return;
      }

      // Создаем отзывы для русского языка
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
              text: "Заказывали комплексное оформление офиса. От проекта до монтажа — все на высшем уровне. Команда Art-Line проявила креативность и понимание нашего бренда.",
              author: "Анна",
              position: "руководитель отдела маркетинга",
              rating: 5
            },
            {
              id: 3,
              text: "Очень доволен работой агентства. Быстро и профессионально сделали брендирование автомобиля. Рекомендую!",
              author: "Сергей",
              position: "предприниматель",
              rating: 5
            },
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