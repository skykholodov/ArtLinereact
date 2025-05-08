import { 
  users, type User, type InsertUser,
  contents, type Content, type InsertContent,
  contentRevisions, type ContentRevision, type InsertContentRevision,
  media, type Media, type InsertMedia,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    
    // Create default admin user if none exists
    this.getUserByUsername("admin").then(user => {
      if (!user) {
        this.createUser({
          username: "admin",
          password: "$2b$10$9eK/pNuVHqPQ5zvHqCHCGu4mO.vbCTnD7IRyEHr5fFwf.QE5xorSi", // "admin123" hashed
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
      insertContent.language
    );

    if (existingContent) {
      // Create revision of the existing content before updating
      await this.createContentRevision({
        contentId: existingContent.id,
        content: existingContent.content,
        createdBy: insertContent.updatedBy
      });

      // Update the existing content
      return this.updateContent(existingContent.id, {
        content: insertContent.content,
        updatedAt: new Date(),
        updatedBy: insertContent.updatedBy
      }) as Promise<Content>;
    }

    // Create new content
    const [content] = await db.insert(contents).values({
      ...insertContent,
      createdAt: new Date(),
      updatedAt: new Date()
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
        createdAt: new Date()
      })
      .returning();
    
    // Get all revisions for this content
    const revisions = await this.getContentRevisions(insertRevision.contentId);
    
    // If we have more than 5 revisions, delete the oldest ones
    if (revisions.length > 5) {
      const revisionsToKeep = revisions.slice(0, 5);
      const lastKeptRevisionId = revisionsToKeep[revisionsToKeep.length - 1].id;
      
      await db
        .delete(contentRevisions)
        .where(
          and(
            eq(contentRevisions.contentId, insertRevision.contentId),
            revisions.filter(r => !revisionsToKeep.some(kr => kr.id === r.id))
              .map(r => eq(contentRevisions.id, r.id))
              .reduce((prev, curr) => prev || curr)
          )
        );
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
      .insert(media as any)
      .values({
        ...insertMedia,
        uploadedAt: new Date()
      })
      .returning();
    
    return mediaItem as Media;
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
      .returning({ id: media.id });
    
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
}