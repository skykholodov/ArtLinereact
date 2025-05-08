import { 
  users, type User, type InsertUser,
  contents, type Content, type InsertContent,
  contentRevisions, type ContentRevision, type InsertContentRevision,
  media, type Media, type InsertMedia,
  contactSubmissions, type ContactSubmission, type InsertContactSubmission
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content operations
  getContent(sectionType: string, sectionKey: string, language: string): Promise<Content | undefined>;
  getAllContentBySectionType(sectionType: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<Content>): Promise<Content | undefined>;
  
  // Content revision operations
  getContentRevisions(contentId: number): Promise<ContentRevision[]>;
  getContentRevisionsByCriteria(sectionType: string, sectionKey: string, language: string): Promise<ContentRevision[]>;
  createContentRevision(revision: InsertContentRevision): Promise<ContentRevision>;
  getContentRevision(id: number): Promise<ContentRevision | undefined>;
  
  // Media operations
  createMedia(media: InsertMedia): Promise<Media>;
  getMediaById(id: number): Promise<Media | undefined>;
  getMediaByCategory(category: string): Promise<Media[]>;
  deleteMedia(id: number): Promise<boolean>;
  getAllMedia(): Promise<Media[]>;
  
  // Contact submission operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmission(id: number): Promise<ContactSubmission | undefined>;
  updateContactSubmission(id: number, data: Partial<ContactSubmission>): Promise<ContactSubmission | undefined>;
  
  // Stats operations
  countContentBySection(sectionType: string): Promise<number>;
  countContentByLanguage(language: string): Promise<number>;
  countAllContent(): Promise<number>;
  countMedia(): Promise<number>;
  countContentRevisions(): Promise<number>;
  countContactSubmissions(): Promise<number>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private contentRevisions: Map<number, ContentRevision>;
  private mediaFiles: Map<number, Media>;
  private contactForms: Map<number, ContactSubmission>;
  
  sessionStore: session.SessionStore;
  
  currentId: {
    user: number;
    content: number;
    contentRevision: number;
    media: number;
    contactSubmission: number;
  };

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.contentRevisions = new Map();
    this.mediaFiles = new Map();
    this.contactForms = new Map();
    
    this.currentId = {
      user: 1,
      content: 1,
      contentRevision: 1,
      media: 1,
      contactSubmission: 1
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create default admin user if none exists
    this.createUser({
      username: "admin",
      password: "password", // Простой пароль для отладки
      name: "Administrator",
      isAdmin: true
    }).then(user => {
      console.log("Default admin user created with ID:", user.id);
    }).catch(err => {
      console.error("Error creating default admin user:", err);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Content operations
  async getContent(sectionType: string, sectionKey: string, language: string): Promise<Content | undefined> {
    return Array.from(this.contents.values()).find(
      (content) => 
        content.sectionType === sectionType && 
        content.sectionKey === sectionKey && 
        content.language === language
    );
  }

  async getAllContentBySectionType(sectionType: string): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.sectionType === sectionType
    );
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
    const id = this.currentId.content++;
    const now = new Date();
    const content: Content = {
      ...insertContent,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.contents.set(id, content);
    return content;
  }

  async updateContent(id: number, updatedFields: Partial<Content>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;

    const updatedContent = { ...content, ...updatedFields };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }

  // Content revision operations
  async getContentRevisions(contentId: number): Promise<ContentRevision[]> {
    return Array.from(this.contentRevisions.values())
      .filter((revision) => revision.contentId === contentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Keep only the 5 most recent revisions
  }

  async getContentRevisionsByCriteria(sectionType: string, sectionKey: string, language: string): Promise<ContentRevision[]> {
    const content = await this.getContent(sectionType, sectionKey, language);
    if (!content) return [];
    return this.getContentRevisions(content.id);
  }

  async createContentRevision(insertRevision: InsertContentRevision): Promise<ContentRevision> {
    const id = this.currentId.contentRevision++;
    const now = new Date();
    const revision: ContentRevision = {
      ...insertRevision,
      id,
      createdAt: now
    };
    
    this.contentRevisions.set(id, revision);
    
    // Limit to 5 revisions per content item
    const contentRevisions = await this.getContentRevisions(insertRevision.contentId);
    if (contentRevisions.length > 5) {
      const oldestRevision = contentRevisions[contentRevisions.length - 1];
      this.contentRevisions.delete(oldestRevision.id);
    }
    
    return revision;
  }

  async getContentRevision(id: number): Promise<ContentRevision | undefined> {
    return this.contentRevisions.get(id);
  }

  // Media operations
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.currentId.media++;
    const now = new Date();
    const media: Media = {
      ...insertMedia,
      id,
      uploadedAt: now
    };
    
    this.mediaFiles.set(id, media);
    return media;
  }

  async getMediaById(id: number): Promise<Media | undefined> {
    return this.mediaFiles.get(id);
  }

  async getMediaByCategory(category: string): Promise<Media[]> {
    return Array.from(this.mediaFiles.values())
      .filter((media) => media.category === category)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  async deleteMedia(id: number): Promise<boolean> {
    return this.mediaFiles.delete(id);
  }

  async getAllMedia(): Promise<Media[]> {
    return Array.from(this.mediaFiles.values())
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  // Contact submission operations
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentId.contactSubmission++;
    const now = new Date();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      createdAt: now,
      processed: false
    };
    
    this.contactForms.set(id, submission);
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactForms.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContactSubmission(id: number): Promise<ContactSubmission | undefined> {
    return this.contactForms.get(id);
  }

  async updateContactSubmission(id: number, data: Partial<ContactSubmission>): Promise<ContactSubmission | undefined> {
    const submission = this.contactForms.get(id);
    if (!submission) return undefined;

    const updatedSubmission = { ...submission, ...data };
    this.contactForms.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Stats operations
  async countContentBySection(sectionType: string): Promise<number> {
    return Array.from(this.contents.values()).filter(
      (content) => content.sectionType === sectionType
    ).length;
  }

  async countContentByLanguage(language: string): Promise<number> {
    return Array.from(this.contents.values()).filter(
      (content) => content.language === language
    ).length;
  }

  async countAllContent(): Promise<number> {
    return this.contents.size;
  }

  async countMedia(): Promise<number> {
    return this.mediaFiles.size;
  }

  async countContentRevisions(): Promise<number> {
    return this.contentRevisions.size;
  }

  async countContactSubmissions(): Promise<number> {
    return this.contactForms.size;
  }
}

import { DatabaseStorage } from "./database-storage";

// Choose between memory storage and database storage
export const storage = new MemStorage();
// export const storage = new DatabaseStorage();
