import { pgTable, text, serial, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull(),
  businessType: text("business_type").notNull(),
  websiteGoals: text("website_goals").notNull(),
  timeline: text("timeline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// POS System Tables
export const posUsers = pgTable("pos_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  paid: boolean("paid").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posProducts = pgTable("pos_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posCustomers = pgTable("pos_customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posSales = pgTable("pos_sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(), // Array of {productId, name, price, quantity}
  customerName: text("customer_name"),
  notes: text("notes"),
  paymentType: text("payment_type").notNull(), // 'cash', 'card', 'snapscan'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

// POS Schema validations
export const insertPosUserSchema = createInsertSchema(posUsers).omit({
  id: true,
  createdAt: true,
});

export const insertPosProductSchema = createInsertSchema(posProducts).omit({
  id: true,
  createdAt: true,
});

export const insertPosCustomerSchema = createInsertSchema(posCustomers).omit({
  id: true,
  createdAt: true,
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// POS Types
export type InsertPosUser = z.infer<typeof insertPosUserSchema>;
export type PosUser = typeof posUsers.$inferSelect;
export type InsertPosProduct = z.infer<typeof insertPosProductSchema>;
export type PosProduct = typeof posProducts.$inferSelect;
export type InsertPosCustomer = z.infer<typeof insertPosCustomerSchema>;
export type PosCustomer = typeof posCustomers.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;
export type PosSale = typeof posSales.$inferSelect;
