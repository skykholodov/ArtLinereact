import { mysqlTable, int, text, boolean, json, timestamp, varchar, index, primaryKey, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users for Authentication
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  isAdmin: true,
});

// Content model for all page sections
export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  sectionType: varchar("section_type", { length: 50 }).notNull(),
  sectionKey: varchar("section_key", { length: 100 }).notNull(),
  language: varchar("language", { length: 10 }).notNull().default("ru"),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: int("created_by").notNull(),
  updatedBy: int("updated_by").notNull(),
}, (table) => {
  return {
    createdByIndex: index("created_by_idx").on(table.createdBy),
    updatedByIndex: index("updated_by_idx").on(table.updatedBy),
  }
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
export const contentRevisions = mysqlTable("content_revisions", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("content_id").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: int("created_by").notNull(),
}, (table) => {
  return {
    contentIdIndex: index("content_id_idx").on(table.contentId),
    createdByIndex: index("rev_created_by_idx").on(table.createdBy),
  }
});

export const insertContentRevisionSchema = createInsertSchema(contentRevisions).pick({
  contentId: true,
  content: true,
  createdBy: true,
});

// Media files for portfolio and other sections
export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: int("size").notNull(),
  path: varchar("path", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  uploadedBy: int("uploaded_by").notNull(),
}, (table) => {
  return {
    uploadedByIndex: index("uploaded_by_idx").on(table.uploadedBy),
  }
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
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  service: varchar("service", { length: 255 }),
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
