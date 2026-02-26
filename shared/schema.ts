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
  preferredLanguage: text("preferred_language").notNull().default("en"), // 'en' for English, 'af' for Afrikaans
  paid: boolean("paid").notNull().default(true),
  companyLogo: text("company_logo"), // Base64 encoded image
  currentUsage: decimal("current_usage", { precision: 10, scale: 2 }).notNull().default("0.00"), // Current month usage amount
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false), // Track if user has completed the welcome tutorial
  trialStartDate: timestamp("trial_start_date"), // Track when the 7-day free trial started
  receiptSettings: jsonb("receipt_settings"), // Custom receipt configuration
  xeroConnected: boolean("xero_connected").notNull().default(false), // XERO integration status
  xeroTenantId: text("xero_tenant_id"), // XERO organization tenant ID
  xeroAccessToken: text("xero_access_token"), // XERO OAuth access token (encrypted)
  xeroRefreshToken: text("xero_refresh_token"), // XERO OAuth refresh token (encrypted)
  xeroTokenExpiry: timestamp("xero_token_expiry"), // When the access token expires
  xeroLastSync: timestamp("xero_last_sync"), // Last successful sync time
  selectedStaffAccountId: integer("selected_staff_account_id"), // Persisted staff account selection
  salesDisplayMode: text("sales_display_mode").notNull().default("grid"), // 'grid' or 'tabs' for category display
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

// Product categories for organizing products
export const posCategories = pgTable("pos_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Package"), // Lucide icon name
  color: text("color").notNull().default("blue"), // Tailwind color name
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posProducts = pgTable("pos_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").references(() => posCategories.id, { onDelete: 'set null' }),
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
  customerId: integer("customer_id").references(() => posCustomers.id),
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

export const posInvoices = pgTable("pos_invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  documentNumber: text("document_number").notNull(), // Auto-generated document number
  documentType: text("document_type").notNull(), // 'invoice' or 'quote'
  status: text("status").notNull().default('draft'), // 'draft', 'sent', 'paid', 'cancelled'
  clientId: integer("client_id").references(() => posCustomers.id),
  clientName: text("client_name"), // Fallback if client is not in customers
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  title: text("title").default('INVOICE'),
  poNumber: text("po_number"), // Purchase order number (optional)
  createdDate: timestamp("created_date").defaultNow().notNull(),
  dueTerms: text("due_terms"), // 'none', '7 days', '14 days', '30 days', '60 days', '90 days'
  dueDate: timestamp("due_date"), // Optional due date
  items: jsonb("items").notNull(), // Array of {productId, name, price, quantity, lineTotal}
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0.00"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // Optional payment method
  paymentDetails: text("payment_details"), // Bank details, payment instructions, etc.
  notes: text("notes"), // Additional notes
  terms: text("terms"), // Terms & conditions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved payment details for invoices
export const posSavedPaymentDetails = pgTable("pos_saved_payment_details", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // User-defined name for the payment details
  details: text("details").notNull(), // Bank details, payment instructions, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Suppliers
export const posSuppliers = pgTable("pos_suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Purchase Orders
export const posPurchaseOrders = pgTable("pos_purchase_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  poNumber: text("po_number").notNull(),
  status: text("status").notNull().default('draft'), // 'draft', 'sent', 'partial', 'received', 'cancelled'
  supplierName: text("supplier_name").notNull(),
  supplierEmail: text("supplier_email"),
  supplierPhone: text("supplier_phone"),
  supplierAddress: text("supplier_address"),
  items: jsonb("items").notNull(), // Array of {productId, name, sku, quantity, costPrice, lineTotal, receivedQty}
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("15.00"),
  shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  expectedDate: timestamp("expected_date"),
  receivedDate: timestamp("received_date"),
  isPaid: boolean("is_paid").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  preferredLanguage: true,
});

export const insertPosCategorySchema = createInsertSchema(posCategories).omit({
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

export const insertPosOpenAccountSchema = createInsertSchema(posOpenAccounts).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertPosInvoiceSchema = createInsertSchema(posInvoices).omit({
  id: true,
  createdAt: true,
  createdDate: true,
});

export const insertPosSavedPaymentDetailsSchema = createInsertSchema(posSavedPaymentDetails).omit({
  id: true,
  createdAt: true,
});

export const insertPosStaffAccountSchema = createInsertSchema(posStaffAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPosSupplierSchema = createInsertSchema(posSuppliers).omit({
  id: true,
  createdAt: true,
});

export const insertPosPurchaseOrderSchema = createInsertSchema(posPurchaseOrders).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  lastUpdated: true,
});

// Receipt Settings Schema
export const receiptSettingsSchema = z.object({
  sections: z.array(z.enum(['logo', 'businessInfo', 'dateTime', 'staffInfo', 'customerInfo', 'items', 'totals', 'paymentInfo', 'messages'])).default(['logo', 'businessInfo', 'dateTime', 'staffInfo', 'customerInfo', 'items', 'totals', 'paymentInfo', 'messages']),
  toggles: z.object({
    showLogo: z.boolean().default(true),
    showBusinessName: z.boolean().default(true),
    showBusinessAddress: z.boolean().default(true),
    showBusinessPhone: z.boolean().default(true),
    showBusinessEmail: z.boolean().default(true),
    showBusinessWebsite: z.boolean().default(false),
    showRegistrationNumber: z.boolean().default(false),
    showVATNumber: z.boolean().default(false),
    showDateTime: z.boolean().default(true),
    showStaffInfo: z.boolean().default(true),
    showCustomerInfo: z.boolean().default(true),
    showPaymentMethod: z.boolean().default(true),
    showCustomHeader: z.boolean().default(false),
    showCustomFooter: z.boolean().default(true),
    showThankYouMessage: z.boolean().default(true),
  }).default({}),
  businessInfo: z.object({
    name: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    registrationNumber: z.string().optional(),
    vatNumber: z.string().optional(),
  }).default({}),
  customMessages: z.object({
    header: z.string().optional(),
    footer: z.string().optional(),
    thankYou: z.string().default('Thank you for your business!'),
  }).default({}),
  logoDataUrl: z.string().optional(),
});

export const defaultReceiptSettings = (): z.infer<typeof receiptSettingsSchema> => ({
  sections: ['logo', 'businessInfo', 'dateTime', 'staffInfo', 'customerInfo', 'items', 'totals', 'paymentInfo', 'messages'],
  toggles: {
    showLogo: true,
    showBusinessName: true,
    showBusinessAddress: true,
    showBusinessPhone: true,
    showBusinessEmail: true,
    showBusinessWebsite: false,
    showRegistrationNumber: false,
    showVATNumber: false,
    showDateTime: true,
    showStaffInfo: true,
    showCustomerInfo: true,
    showPaymentMethod: true,
    showCustomHeader: false,
    showCustomFooter: true,
    showThankYouMessage: true,
  },
  businessInfo: {},
  customMessages: {
    thankYou: 'Thank you for your business!',
  },
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
export type InsertPosCategory = z.infer<typeof insertPosCategorySchema>;
export type PosCategory = typeof posCategories.$inferSelect;
export type InsertPosProduct = z.infer<typeof insertPosProductSchema>;
export type PosProduct = typeof posProducts.$inferSelect;
export type InsertPosCustomer = z.infer<typeof insertPosCustomerSchema>;
export type PosCustomer = typeof posCustomers.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;
export type PosSale = typeof posSales.$inferSelect;
export type InsertPosOpenAccount = z.infer<typeof insertPosOpenAccountSchema>;
export type PosOpenAccount = typeof posOpenAccounts.$inferSelect;
export type InsertPosInvoice = z.infer<typeof insertPosInvoiceSchema>;
export type PosInvoice = typeof posInvoices.$inferSelect;
export type InsertPosSavedPaymentDetails = z.infer<typeof insertPosSavedPaymentDetailsSchema>;
export type PosSavedPaymentDetails = typeof posSavedPaymentDetails.$inferSelect;
export type InsertPosStaffAccount = z.infer<typeof insertPosStaffAccountSchema>;
export type PosStaffAccount = typeof posStaffAccounts.$inferSelect;
export type InsertPosSupplier = z.infer<typeof insertPosSupplierSchema>;
export type PosSupplier = typeof posSuppliers.$inferSelect;
export type InsertPosPurchaseOrder = z.infer<typeof insertPosPurchaseOrderSchema>;
export type PosPurchaseOrder = typeof posPurchaseOrders.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type ReceiptSettings = z.infer<typeof receiptSettingsSchema>;
