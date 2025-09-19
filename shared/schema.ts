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
  firstName: text("first_name").notNull().default("User"),
  lastName: text("last_name").notNull().default("Account"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull().default("My Company"),
  paid: boolean("paid").notNull().default(true),
  companyLogo: text("company_logo"), // Base64 encoded image
  currentUsage: decimal("current_usage", { precision: 10, scale: 2 }).notNull().default("0.00"), // Current month usage amount
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false), // Track if user has completed the welcome tutorial
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posStaffAccounts = pgTable("pos_staff_accounts", {
  id: serial("id").primaryKey(),
  posUserId: integer("pos_user_id").references(() => posUsers.id, { onDelete: 'cascade' }).notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  userType: text("user_type").notNull(), // 'staff' or 'management'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posProducts = pgTable("pos_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sku: text("sku").notNull(),
  name: text("name").notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  tradePrice: decimal("trade_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posCustomers = pgTable("pos_customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  customerType: text("customer_type").notNull().default('retail'), // 'retail' or 'trade'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posSales = pgTable("pos_sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  staffAccountId: integer("staff_account_id").references(() => posStaffAccounts.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  items: jsonb("items").notNull(), // Array of {productId, name, price, quantity}
  customerName: text("customer_name"),
  notes: text("notes"),
  paymentType: text("payment_type").notNull(), // 'cash', 'card', 'eft'
  isVoided: boolean("is_voided").notNull().default(false),
  voidReason: text("void_reason"),
  voidedAt: timestamp("voided_at"),
  voidedBy: integer("voided_by").references(() => posStaffAccounts.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posOpenAccounts = pgTable("pos_open_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountName: text("account_name").notNull(), // Table name or customer name
  accountType: text("account_type").notNull(), // "table" or "customer"
  items: jsonb("items").notNull(), // Array of {productId, name, price, quantity}
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// System settings for tracking admin operations like monthly resets
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
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

export const signupPosUserSchema = createInsertSchema(posUsers).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  companyName: true,
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

export const insertPosOpenAccountSchema = createInsertSchema(posOpenAccounts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertPosStaffAccountSchema = createInsertSchema(posStaffAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// POS Types
export type InsertPosUser = z.infer<typeof insertPosUserSchema>;
export type SignupPosUser = z.infer<typeof signupPosUserSchema>;
export type PosUser = typeof posUsers.$inferSelect;
export type InsertPosProduct = z.infer<typeof insertPosProductSchema>;
export type PosProduct = typeof posProducts.$inferSelect;
export type InsertPosCustomer = z.infer<typeof insertPosCustomerSchema>;
export type PosCustomer = typeof posCustomers.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;
export type PosSale = typeof posSales.$inferSelect;
export type InsertPosOpenAccount = z.infer<typeof insertPosOpenAccountSchema>;
export type PosOpenAccount = typeof posOpenAccounts.$inferSelect;
export type InsertPosStaffAccount = z.infer<typeof insertPosStaffAccountSchema>;
export type PosStaffAccount = typeof posStaffAccounts.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
