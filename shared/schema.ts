import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users for Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  isAdmin: true,
});

// Content model for all page sections
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  sectionType: varchar("section_type", { length: 50 }).notNull(),
  sectionKey: varchar("section_key", { length: 100 }).notNull(),
  language: varchar("language", { length: 10 }).notNull().default("ru"),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
});

export const insertContentSchema = createInsertSchema(contents).pick({
  sectionType: true,
  sectionKey: true,
  language: true,
  content: true,
  createdBy: true,
  updatedBy: true,
});

// Content revisions for version control
export const contentRevisions = pgTable("content_revisions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contents.id),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertContentRevisionSchema = createInsertSchema(contentRevisions).pick({
  contentId: true,
  content: true,
  createdBy: true,
});

// Media files for portfolio and other sections
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  path: text("path").notNull(),
  category: varchar("category", { length: 50 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
});

export const insertMediaSchema = createInsertSchema(media).pick({
  filename: true,
  originalName: true,
  mimeType: true,
  size: true,
  path: true,
  category: true,
  uploadedBy: true,
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  service: text("service"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processed: boolean("processed").default(false).notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  phone: true,
  email: true,
  service: true,
  message: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type ContentRevision = typeof contentRevisions.$inferSelect;
export type InsertContentRevision = z.infer<typeof insertContentRevisionSchema>;

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
