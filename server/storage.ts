import { 
  users, contactSubmissions, posUsers, posProducts, posCustomers, posSales, posOpenAccounts, posInvoices, posStaffAccounts, posSavedPaymentDetails, systemSettings, posCategories,
  type User, type InsertUser, type ContactSubmission, type InsertContactSubmission,
  type PosUser, type InsertPosUser, type PosProduct, type InsertPosProduct,
  type PosCustomer, type InsertPosCustomer, type PosSale, type InsertPosSale,
  type PosOpenAccount, type InsertPosOpenAccount, type PosInvoice, type InsertPosInvoice,
  type PosSavedPaymentDetails, type InsertPosSavedPaymentDetails,
  type PosStaffAccount, type InsertPosStaffAccount,
  type SystemSetting, type InsertSystemSetting,
  type PosCategory, type InsertPosCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Secure password hashing using Node.js built-in crypto
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // SECURITY: Disable plaintext passwords in production
  // Only allow for development/demo purposes
  if (!storedHash.includes(':')) {
    console.warn('WARNING: Plaintext password detected. This should not be used in production!');
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      console.error('SECURITY ERROR: Plaintext passwords not allowed in production');
      return false;
    }
    return password === storedHash;
  }
  
  // Handle scrypt format (salt:hash)
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }
  
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const { timingSafeEqual } = await import('crypto');
  return timingSafeEqual(hashBuffer, derivedKey);
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // POS Operations
  getAllPosUsers(): Promise<PosUser[]>;
  getPosUser(id: number): Promise<PosUser | undefined>;
  getPosUserByEmail(email: string): Promise<PosUser | undefined>;
  createPosUser(user: InsertPosUser): Promise<PosUser>;
  updatePosUserLogo(id: number, logo: string): Promise<PosUser | undefined>;
  updatePosUserTutorialStatus(id: number, completed: boolean): Promise<PosUser | undefined>;
  updatePosUserReceiptSettings(id: number, settings: any): Promise<PosUser | undefined>;
  updatePosUserPreferredLanguage(id: number, language: string): Promise<PosUser | undefined>;
  updatePosUserStaffSelection(id: number, staffAccountId: number | null): Promise<PosUser | undefined>;
  updatePosUserPassword(id: number, hashedPassword: string): Promise<PosUser | undefined>;
  
  // Category Operations
  getPosCategories(userId: number): Promise<PosCategory[]>;
  createPosCategory(category: InsertPosCategory): Promise<PosCategory>;
  updatePosCategory(id: number, category: Partial<PosCategory>): Promise<PosCategory | undefined>;
  deletePosCategory(id: number): Promise<boolean>;
  
  // Product Operations
  getPosProducts(userId: number): Promise<PosProduct[]>;
  createPosProduct(product: InsertPosProduct): Promise<PosProduct>;
  updatePosProduct(id: number, product: Partial<PosProduct>): Promise<PosProduct | undefined>;
  deletePosProduct(id: number): Promise<boolean>;
  
  // Display Mode Operations
  updatePosUserSalesDisplayMode(id: number, mode: string): Promise<PosUser | undefined>;
  
  getPosCustomers(userId: number): Promise<PosCustomer[]>;
  createPosCustomer(customer: InsertPosCustomer): Promise<PosCustomer>;
  updatePosCustomer(id: number, customer: Partial<PosCustomer>): Promise<PosCustomer | undefined>;
  deletePosCustomer(id: number): Promise<boolean>;
  
  getPosSales(userId: number): Promise<PosSale[]>;
  createPosSale(sale: InsertPosSale): Promise<PosSale>;
  voidPosSale(saleId: number, voidReason: string, voidedBy: number): Promise<PosSale | undefined>;
  
  // Open Accounts Operations
  getPosOpenAccounts(userId: number): Promise<PosOpenAccount[]>;
  createPosOpenAccount(account: InsertPosOpenAccount): Promise<PosOpenAccount>;
  updatePosOpenAccount(id: number, account: Partial<PosOpenAccount>): Promise<PosOpenAccount | undefined>;
  deletePosOpenAccount(id: number): Promise<boolean>;
  addItemToPosOpenAccount(accountId: number, item: any): Promise<PosOpenAccount | undefined>;
  removeItemFromPosOpenAccount(accountId: number, itemIndex: number): Promise<PosOpenAccount | undefined>;
  
  // Invoice Operations
  getPosInvoices(userId: number): Promise<PosInvoice[]>;
  createPosInvoice(invoice: InsertPosInvoice): Promise<PosInvoice>;
  updatePosInvoice(id: number, invoice: Partial<PosInvoice>): Promise<PosInvoice | undefined>;
  deletePosInvoice(id: number): Promise<boolean>;
  getNextDocumentNumber(userId: number, documentType: string): Promise<string>;
  
  // Saved Payment Details Operations
  getSavedPaymentDetails(userId: number): Promise<PosSavedPaymentDetails[]>;
  createSavedPaymentDetails(details: InsertPosSavedPaymentDetails): Promise<PosSavedPaymentDetails>;
  deleteSavedPaymentDetails(id: number): Promise<boolean>;
  
  // Staff Account Operations
  getPosStaffAccounts(posUserId: number): Promise<PosStaffAccount[]>;
  createPosStaffAccount(staffAccount: InsertPosStaffAccount): Promise<PosStaffAccount>;
  updatePosStaffAccount(id: number, staffAccount: Partial<PosStaffAccount>): Promise<PosStaffAccount | undefined>;
  deletePosStaffAccount(id: number): Promise<boolean>;
  authenticateStaffAccount(posUserId: number, username: string, password: string): Promise<PosStaffAccount | undefined>;

  // Usage tracking
  incrementUserUsage(userId: number, amount: string): Promise<void>;
  resetAllUsersUsage(): Promise<void>;
  getUserUsage(userId: number): Promise<string>;
  
  // System settings for idempotent operations
  getSystemSetting(key: string): Promise<string | null>;
  setSystemSetting(key: string, value: string): Promise<void>;
  getLastMonthlyResetDate(): Promise<string | null>;
  setLastMonthlyResetDate(date: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private currentUserId: number;
  private currentContactId: number;
  
  // POS Storage
  private posUsers: Map<number, PosUser>;
  private posProducts: Map<number, PosProduct>;
  private posCustomers: Map<number, PosCustomer>;
  private posSales: Map<number, PosSale>;
  private posOpenAccounts: Map<number, PosOpenAccount>;
  private currentPosUserId: number;
  private currentPosProductId: number;
  private currentPosCustomerId: number;
  private currentPosSaleId: number;
  private currentPosOpenAccountId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.currentUserId = 1;
    this.currentContactId = 1;
    
    // POS Storage initialization
    this.posUsers = new Map();
    this.posProducts = new Map();
    this.posCustomers = new Map();
    this.posSales = new Map();
    this.posOpenAccounts = new Map();
    this.currentPosUserId = 1;
    this.currentPosProductId = 1;
    this.currentPosCustomerId = 1;
    this.currentPosSaleId = 1;
    this.currentPosOpenAccountId = 1;
    
    // Create demo POS user and data
    this.createDemoPosUser();
    setTimeout(() => this.createDemoData(), 0);
  }
  
  private async createDemoPosUser() {
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const demoUser: PosUser = {
      id: 1,
      firstName: "Demo",
      lastName: "User",
      email: "demo@storm.co.za",
      password: hashedPassword,
      companyName: "Demo Company",
      paid: true,
      companyLogo: null,
      createdAt: new Date(),
    };
    this.posUsers.set(1, demoUser);
    this.currentPosUserId = 2;
  }

  private async createDemoData() {
    // Demo products
    const products = [
      { sku: "PROD001", name: "Coffee - Espresso", price: "25.00", quantity: 50 },
      { sku: "PROD002", name: "Coffee - Cappuccino", price: "30.00", quantity: 45 },
      { sku: "PROD003", name: "Pastry - Croissant", price: "15.00", quantity: 20 },
      { sku: "PROD004", name: "Sandwich - Chicken", price: "45.00", quantity: 15 },
      { sku: "PROD005", name: "Muffin - Blueberry", price: "20.00", quantity: 30 },
      { sku: "PROD006", name: "Tea - Earl Grey", price: "22.00", quantity: 40 },
    ];

    for (const product of products) {
      const newProduct: PosProduct = {
        id: this.currentPosProductId++,
        userId: 1,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        createdAt: new Date(),
      };
      this.posProducts.set(newProduct.id, newProduct);
    }

    // Demo customers
    const customers = [
      { name: "John Smith", phone: "+27123456789", notes: "Regular customer" },
      { name: "Sarah Johnson", phone: "+27987654321", notes: "Prefers oat milk" },
    ];

    for (const customer of customers) {
      const newCustomer: PosCustomer = {
        id: this.currentPosCustomerId++,
        userId: 1,
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes,
        createdAt: new Date(),
      };
      this.posCustomers.set(newCustomer.id, newCustomer);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    const submission: ContactSubmission = {
      id,
      fullName: insertSubmission.fullName,
      businessName: insertSubmission.businessName,
      email: insertSubmission.email,
      businessType: insertSubmission.businessType,
      websiteGoals: insertSubmission.websiteGoals,
      timeline: insertSubmission.timeline || null,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  // POS User Methods
  async getAllPosUsers(): Promise<PosUser[]> {
    return Array.from(this.posUsers.values());
  }

  async getPosUser(id: number): Promise<PosUser | undefined> {
    return this.posUsers.get(id);
  }

  async getPosUserByEmail(email: string): Promise<PosUser | undefined> {
    return Array.from(this.posUsers.values()).find(user => user.email === email);
  }

  async createPosUser(insertUser: InsertPosUser): Promise<PosUser> {
    const id = this.currentPosUserId++;
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: PosUser = {
      id,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      password: hashedPassword,
      companyName: insertUser.companyName,
      paid: insertUser.paid || false,
      companyLogo: insertUser.companyLogo || null,
      createdAt: new Date(),
    };
    this.posUsers.set(id, user);
    return user;
  }

  async updatePosUserLogo(id: number, logo: string): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, companyLogo: logo };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserTutorialStatus(id: number, completed: boolean): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, tutorialCompleted: completed };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserReceiptSettings(id: number, settings: any): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, receiptSettings: settings };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserPreferredLanguage(id: number, language: string): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, preferredLanguage: language };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserStaffSelection(id: number, staffAccountId: number | null): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, selectedStaffAccountId: staffAccountId };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserPassword(id: number, hashedPassword: string): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, password: hashedPassword };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  async updatePosUserSalesDisplayMode(id: number, mode: string): Promise<PosUser | undefined> {
    const user = this.posUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: PosUser = { ...user, salesDisplayMode: mode };
    this.posUsers.set(id, updatedUser);
    return updatedUser;
  }

  // Category stub methods (MemStorage - not used in production)
  async getPosCategories(userId: number): Promise<PosCategory[]> {
    return [];
  }

  async createPosCategory(category: InsertPosCategory): Promise<PosCategory> {
    throw new Error("MemStorage: Categories not supported");
  }

  async updatePosCategory(id: number, category: Partial<PosCategory>): Promise<PosCategory | undefined> {
    return undefined;
  }

  async deletePosCategory(id: number): Promise<boolean> {
    return false;
  }

  // POS Product Methods
  async getPosProducts(userId: number): Promise<PosProduct[]> {
    return Array.from(this.posProducts.values()).filter(product => product.userId === userId);
  }

  async createPosProduct(insertProduct: InsertPosProduct): Promise<PosProduct> {
    const id = this.currentPosProductId++;
    const product: PosProduct = {
      id,
      userId: insertProduct.userId,
      sku: insertProduct.sku,
      name: insertProduct.name,
      price: insertProduct.price,
      quantity: insertProduct.quantity || 0,
      createdAt: new Date(),
    };
    this.posProducts.set(id, product);
    return product;
  }

  async updatePosProduct(id: number, updates: Partial<PosProduct>): Promise<PosProduct | undefined> {
    const existing = this.posProducts.get(id);
    if (!existing) return undefined;
    
    const updated: PosProduct = { ...existing, ...updates };
    this.posProducts.set(id, updated);
    return updated;
  }

  async deletePosProduct(id: number): Promise<boolean> {
    return this.posProducts.delete(id);
  }

  // POS Customer Methods
  async getPosCustomers(userId: number): Promise<PosCustomer[]> {
    return Array.from(this.posCustomers.values()).filter(customer => customer.userId === userId);
  }

  async createPosCustomer(insertCustomer: InsertPosCustomer): Promise<PosCustomer> {
    const id = this.currentPosCustomerId++;
    const customer: PosCustomer = {
      id,
      userId: insertCustomer.userId,
      name: insertCustomer.name,
      phone: insertCustomer.phone || null,
      notes: insertCustomer.notes || null,
      createdAt: new Date(),
    };
    this.posCustomers.set(id, customer);
    return customer;
  }

  async updatePosCustomer(id: number, updates: Partial<PosCustomer>): Promise<PosCustomer | undefined> {
    const existing = this.posCustomers.get(id);
    if (!existing) return undefined;
    
    const updated: PosCustomer = { ...existing, ...updates };
    this.posCustomers.set(id, updated);
    return updated;
  }

  async deletePosCustomer(id: number): Promise<boolean> {
    return this.posCustomers.delete(id);
  }

  // POS Sales Methods
  async getPosSales(userId: number): Promise<PosSale[]> {
    return Array.from(this.posSales.values()).filter(sale => sale.userId === userId);
  }

  async createPosSale(insertSale: InsertPosSale): Promise<PosSale> {
    const id = this.currentPosSaleId++;
    const sale: PosSale = {
      id,
      userId: insertSale.userId,
      staffAccountId: insertSale.staffAccountId || null,
      total: insertSale.total,
      items: insertSale.items,
      customerName: insertSale.customerName || null,
      notes: insertSale.notes || null,
      paymentType: insertSale.paymentType,
      isVoided: false,
      voidReason: null,
      voidedAt: null,
      voidedBy: null,
      createdAt: new Date(),
    };
    this.posSales.set(id, sale);
    return sale;
  }

  async voidPosSale(saleId: number, voidReason: string, voidedBy: number): Promise<PosSale | undefined> {
    const sale = this.posSales.get(saleId);
    if (!sale || sale.isVoided) return undefined;
    
    const voidedSale: PosSale = {
      ...sale,
      isVoided: true,
      voidReason,
      voidedAt: new Date(),
      voidedBy,
    };
    
    this.posSales.set(saleId, voidedSale);
    return voidedSale;
  }

  // Open Accounts Methods
  async getPosOpenAccounts(userId: number): Promise<PosOpenAccount[]> {
    return Array.from(this.posOpenAccounts.values()).filter(account => account.userId === userId);
  }

  async createPosOpenAccount(insertAccount: InsertPosOpenAccount): Promise<PosOpenAccount> {
    const id = this.currentPosOpenAccountId++;
    const account: PosOpenAccount = {
      id,
      userId: insertAccount.userId,
      accountName: insertAccount.accountName,
      accountType: insertAccount.accountType,
      items: insertAccount.items,
      total: insertAccount.total,
      notes: insertAccount.notes || null,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    this.posOpenAccounts.set(id, account);
    return account;
  }

  async updatePosOpenAccount(id: number, updates: Partial<PosOpenAccount>): Promise<PosOpenAccount | undefined> {
    const existing = this.posOpenAccounts.get(id);
    if (!existing) return undefined;
    
    const updated: PosOpenAccount = { 
      ...existing, 
      ...updates, 
      lastUpdated: new Date() 
    };
    this.posOpenAccounts.set(id, updated);
    return updated;
  }

  async deletePosOpenAccount(id: number): Promise<boolean> {
    return this.posOpenAccounts.delete(id);
  }

  async addItemToPosOpenAccount(accountId: number, item: any): Promise<PosOpenAccount | undefined> {
    const account = this.posOpenAccounts.get(accountId);
    if (!account) return undefined;
    
    const items = Array.isArray(account.items) ? account.items : [];
    const updatedItems = [...items, item];
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    const updated: PosOpenAccount = { 
      ...account, 
      items: updatedItems,
      total: newTotal.toFixed(2),
      lastUpdated: new Date() 
    };
    this.posOpenAccounts.set(accountId, updated);
    return updated;
  }

  async removeItemFromPosOpenAccount(accountId: number, itemIndex: number): Promise<PosOpenAccount | undefined> {
    const account = this.posOpenAccounts.get(accountId);
    if (!account) return undefined;
    
    const items = Array.isArray(account.items) ? account.items : [];
    if (itemIndex < 0 || itemIndex >= items.length) return undefined;
    
    const updatedItems = items.filter((_, index) => index !== itemIndex);
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    const updated: PosOpenAccount = { 
      ...account, 
      items: updatedItems,
      total: newTotal.toFixed(2),
      lastUpdated: new Date() 
    };
    this.posOpenAccounts.set(accountId, updated);
    return updated;
  }

  // Invoice Operations (stub implementations for MemStorage)
  async getPosInvoices(userId: number): Promise<PosInvoice[]> {
    return [];
  }

  async createPosInvoice(insertInvoice: InsertPosInvoice): Promise<PosInvoice> {
    throw new Error("Invoice operations not supported in MemStorage");
  }

  async updatePosInvoice(id: number, updates: Partial<PosInvoice>): Promise<PosInvoice | undefined> {
    return undefined;
  }

  async deletePosInvoice(id: number): Promise<boolean> {
    return false;
  }

  async getNextDocumentNumber(userId: number, documentType: string): Promise<string> {
    return documentType === 'invoice' ? 'INV-0001' : 'QUO-0001';
  }

  // Saved Payment Details Operations (stub implementations for MemStorage)
  async getSavedPaymentDetails(userId: number): Promise<PosSavedPaymentDetails[]> {
    return [];
  }

  async createSavedPaymentDetails(details: InsertPosSavedPaymentDetails): Promise<PosSavedPaymentDetails> {
    throw new Error("Saved payment details not supported in MemStorage");
  }

  async deleteSavedPaymentDetails(id: number): Promise<boolean> {
    return false;
  }

  // Staff Account Operations (stub implementations for MemStorage)
  async getPosStaffAccounts(posUserId: number): Promise<PosStaffAccount[]> {
    return [];
  }

  async createPosStaffAccount(staffAccount: InsertPosStaffAccount): Promise<PosStaffAccount> {
    throw new Error("Staff operations not supported in MemStorage");
  }

  async updatePosStaffAccount(id: number, staffAccount: Partial<PosStaffAccount>): Promise<PosStaffAccount | undefined> {
    return undefined;
  }

  async deletePosStaffAccount(id: number): Promise<boolean> {
    return false;
  }

  async authenticateStaffAccount(posUserId: number, username: string, password: string): Promise<PosStaffAccount | undefined> {
    return undefined;
  }

  // Usage tracking (stub implementations for MemStorage)
  async incrementUserUsage(userId: number, amount: string): Promise<void> {
    // No-op in MemStorage
  }

  async resetAllUsersUsage(): Promise<void> {
    // No-op in MemStorage
  }

  async getUserUsage(userId: number): Promise<string> {
    return "0.00";
  }

  // System settings (stub implementations for MemStorage)
  async getSystemSetting(key: string): Promise<string | null> {
    return null;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    // No-op in MemStorage
  }

  async getLastMonthlyResetDate(): Promise<string | null> {
    return null;
  }

  async setLastMonthlyResetDate(date: string): Promise<void> {
    // No-op in MemStorage
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions);
  }

  // POS Operations
  async getAllPosUsers(): Promise<PosUser[]> {
    return db.select().from(posUsers);
  }

  async getPosUser(id: number): Promise<PosUser | undefined> {
    const [user] = await db.select().from(posUsers).where(eq(posUsers.id, id));
    return user || undefined;
  }

  async getPosUserByEmail(email: string): Promise<PosUser | undefined> {
    const [user] = await db.select().from(posUsers).where(eq(posUsers.email, email));
    return user || undefined;
  }

  async createPosUser(insertUser: InsertPosUser): Promise<PosUser> {
    const hashedPassword = await hashPassword(insertUser.password);
    const [user] = await db
      .insert(posUsers)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async updatePosUserLogo(id: number, logo: string): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ companyLogo: logo })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserTutorialStatus(id: number, completed: boolean): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ tutorialCompleted: completed })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserReceiptSettings(id: number, settings: any): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ receiptSettings: settings })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserPreferredLanguage(id: number, language: string): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ preferredLanguage: language })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserStaffSelection(id: number, staffAccountId: number | null): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ selectedStaffAccountId: staffAccountId })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserPassword(id: number, hashedPassword: string): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ password: hashedPassword })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  async updatePosUserSalesDisplayMode(id: number, mode: string): Promise<PosUser | undefined> {
    const [user] = await db
      .update(posUsers)
      .set({ salesDisplayMode: mode })
      .where(eq(posUsers.id, id))
      .returning();
    return user || undefined;
  }

  // Category Methods
  async getPosCategories(userId: number): Promise<PosCategory[]> {
    return db.select().from(posCategories).where(eq(posCategories.userId, userId));
  }

  async createPosCategory(insertCategory: InsertPosCategory): Promise<PosCategory> {
    const [category] = await db
      .insert(posCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updatePosCategory(id: number, updates: Partial<PosCategory>): Promise<PosCategory | undefined> {
    const [category] = await db
      .update(posCategories)
      .set(updates)
      .where(eq(posCategories.id, id))
      .returning();
    return category || undefined;
  }

  async deletePosCategory(id: number): Promise<boolean> {
    const result = await db.delete(posCategories).where(eq(posCategories.id, id));
    return result.rowCount > 0;
  }

  async getPosProducts(userId: number): Promise<PosProduct[]> {
    return db.select().from(posProducts).where(eq(posProducts.userId, userId));
  }

  async createPosProduct(insertProduct: InsertPosProduct): Promise<PosProduct> {
    const [product] = await db
      .insert(posProducts)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updatePosProduct(id: number, updates: Partial<PosProduct>): Promise<PosProduct | undefined> {
    const [product] = await db
      .update(posProducts)
      .set(updates)
      .where(eq(posProducts.id, id))
      .returning();
    return product || undefined;
  }

  async deletePosProduct(id: number): Promise<boolean> {
    const result = await db.delete(posProducts).where(eq(posProducts.id, id));
    return result.rowCount > 0;
  }

  async getPosCustomers(userId: number): Promise<PosCustomer[]> {
    return db.select().from(posCustomers).where(eq(posCustomers.userId, userId));
  }

  async createPosCustomer(insertCustomer: InsertPosCustomer): Promise<PosCustomer> {
    const [customer] = await db
      .insert(posCustomers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async updatePosCustomer(id: number, updates: Partial<PosCustomer>): Promise<PosCustomer | undefined> {
    const [customer] = await db
      .update(posCustomers)
      .set(updates)
      .where(eq(posCustomers.id, id))
      .returning();
    return customer || undefined;
  }

  async deletePosCustomer(id: number): Promise<boolean> {
    const result = await db.delete(posCustomers).where(eq(posCustomers.id, id));
    return result.rowCount > 0;
  }

  async getPosSales(userId: number): Promise<PosSale[]> {
    return db.select().from(posSales).where(eq(posSales.userId, userId));
  }

  async createPosSale(insertSale: InsertPosSale): Promise<PosSale> {
    const [sale] = await db
      .insert(posSales)
      .values(insertSale)
      .returning();
    return sale;
  }

  // Open Accounts Methods
  async getPosOpenAccounts(userId: number): Promise<PosOpenAccount[]> {
    return db.select().from(posOpenAccounts).where(eq(posOpenAccounts.userId, userId));
  }

  async createPosOpenAccount(insertAccount: InsertPosOpenAccount): Promise<PosOpenAccount> {
    const [account] = await db
      .insert(posOpenAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updatePosOpenAccount(id: number, updates: Partial<PosOpenAccount>): Promise<PosOpenAccount | undefined> {
    const [account] = await db
      .update(posOpenAccounts)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(posOpenAccounts.id, id))
      .returning();
    return account || undefined;
  }

  async deletePosOpenAccount(id: number): Promise<boolean> {
    const result = await db.delete(posOpenAccounts).where(eq(posOpenAccounts.id, id));
    return result.rowCount > 0;
  }

  async addItemToPosOpenAccount(accountId: number, item: any): Promise<PosOpenAccount | undefined> {
    const [account] = await db.select().from(posOpenAccounts).where(eq(posOpenAccounts.id, accountId));
    if (!account) return undefined;
    
    const items = Array.isArray(account.items) ? account.items : [];
    const updatedItems = [...items, item];
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    const [updated] = await db
      .update(posOpenAccounts)
      .set({ 
        items: updatedItems,
        total: newTotal.toFixed(2),
        lastUpdated: new Date() 
      })
      .where(eq(posOpenAccounts.id, accountId))
      .returning();
    return updated || undefined;
  }

  async removeItemFromPosOpenAccount(accountId: number, itemIndex: number): Promise<PosOpenAccount | undefined> {
    const [account] = await db.select().from(posOpenAccounts).where(eq(posOpenAccounts.id, accountId));
    if (!account) return undefined;
    
    const items = Array.isArray(account.items) ? account.items : [];
    if (itemIndex < 0 || itemIndex >= items.length) return undefined;
    
    const updatedItems = items.filter((_, index) => index !== itemIndex);
    
    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    
    const [updated] = await db
      .update(posOpenAccounts)
      .set({ 
        items: updatedItems,
        total: newTotal.toFixed(2),
        lastUpdated: new Date() 
      })
      .where(eq(posOpenAccounts.id, accountId))
      .returning();
    return updated || undefined;
  }

  // Invoice Operations
  async getPosInvoices(userId: number): Promise<PosInvoice[]> {
    return db.select().from(posInvoices).where(eq(posInvoices.userId, userId));
  }

  async createPosInvoice(insertInvoice: InsertPosInvoice): Promise<PosInvoice> {
    const [invoice] = await db
      .insert(posInvoices)
      .values(insertInvoice)
      .returning();
    return invoice;
  }

  async updatePosInvoice(id: number, updates: Partial<PosInvoice>): Promise<PosInvoice | undefined> {
    const [invoice] = await db
      .update(posInvoices)
      .set(updates)
      .where(eq(posInvoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async deletePosInvoice(id: number): Promise<boolean> {
    const result = await db.delete(posInvoices).where(eq(posInvoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getNextDocumentNumber(userId: number, documentType: string): Promise<string> {
    // Get the highest document number for this user and document type
    const [latest] = await db
      .select({ documentNumber: posInvoices.documentNumber })
      .from(posInvoices)
      .where(and(
        eq(posInvoices.userId, userId),
        eq(posInvoices.documentType, documentType)
      ))
      .orderBy(sql`id DESC`)
      .limit(1);

    if (!latest || !latest.documentNumber) {
      // First document for this user and type
      return documentType === 'invoice' ? 'INV-0001' : 'QUO-0001';
    }

    // Extract number from document number (e.g., "INV-0005" -> 5)
    const match = latest.documentNumber.match(/(\d+)$/);
    if (!match) {
      return documentType === 'invoice' ? 'INV-0001' : 'QUO-0001';
    }

    const nextNum = parseInt(match[1]) + 1;
    const prefix = documentType === 'invoice' ? 'INV' : 'QUO';
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  }

  // Saved Payment Details Operations
  async getSavedPaymentDetails(userId: number): Promise<PosSavedPaymentDetails[]> {
    return db.select().from(posSavedPaymentDetails).where(eq(posSavedPaymentDetails.userId, userId));
  }

  async createSavedPaymentDetails(details: InsertPosSavedPaymentDetails): Promise<PosSavedPaymentDetails> {
    const [created] = await db
      .insert(posSavedPaymentDetails)
      .values(details)
      .returning();
    return created;
  }

  async deleteSavedPaymentDetails(id: number): Promise<boolean> {
    const result = await db.delete(posSavedPaymentDetails).where(eq(posSavedPaymentDetails.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Staff Account Operations
  async getPosStaffAccounts(posUserId: number): Promise<PosStaffAccount[]> {
    return await db.select().from(posStaffAccounts).where(eq(posStaffAccounts.posUserId, posUserId));
  }

  async createPosStaffAccount(staffAccount: InsertPosStaffAccount): Promise<PosStaffAccount> {
    const hashedPassword = await hashPassword(staffAccount.password);
    const staffAccountWithHashedPassword = {
      ...staffAccount,
      password: hashedPassword
    };
    const [created] = await db.insert(posStaffAccounts).values(staffAccountWithHashedPassword).returning();
    return created;
  }

  async updatePosStaffAccount(id: number, staffAccount: Partial<PosStaffAccount>): Promise<PosStaffAccount | undefined> {
    const [updated] = await db.update(posStaffAccounts)
      .set(staffAccount)
      .where(eq(posStaffAccounts.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePosStaffAccount(id: number): Promise<boolean> {
    const result = await db.delete(posStaffAccounts).where(eq(posStaffAccounts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async authenticateStaffAccount(posUserId: number, username: string, password: string): Promise<PosStaffAccount | undefined> {
    // First get the staff account by user ID, username, and active status (without password comparison)
    const [staff] = await db.select().from(posStaffAccounts)
      .where(and(
        eq(posStaffAccounts.posUserId, posUserId),
        eq(posStaffAccounts.username, username),
        eq(posStaffAccounts.isActive, true)
      ));
    
    // If staff account exists, verify password using our secure scrypt implementation
    if (staff && await verifyPassword(password, staff.password)) {
      return staff;
    }
    
    return undefined;
  }

  async voidPosSale(saleId: number, voidReason: string, voidedBy: number): Promise<PosSale | undefined> {
    const [sale] = await db
      .update(posSales)
      .set({ 
        isVoided: true, 
        voidReason, 
        voidedAt: new Date(), 
        voidedBy 
      })
      .where(eq(posSales.id, saleId))
      .returning();
    return sale || undefined;
  }

  // Usage tracking methods
  async incrementUserUsage(userId: number, amount: string): Promise<void> {
    await db
      .update(posUsers)
      .set({ 
        currentUsage: sql`current_usage + ${amount}`
      })
      .where(eq(posUsers.id, userId));
  }

  async resetAllUsersUsage(): Promise<void> {
    await db
      .update(posUsers)
      .set({ currentUsage: "0.00" });
  }

  async getUserUsage(userId: number): Promise<string> {
    const [user] = await db
      .select({ currentUsage: posUsers.currentUsage })
      .from(posUsers)
      .where(eq(posUsers.id, userId));
    return user?.currentUsage || "0.00";
  }

  // System settings methods for idempotent operations
  async getSystemSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select({ settingValue: systemSettings.settingValue })
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, key));
    return setting?.settingValue || null;
  }

  async setSystemSetting(key: string, value: string): Promise<void> {
    await db
      .insert(systemSettings)
      .values({ settingKey: key, settingValue: value })
      .onConflictDoUpdate({
        target: systemSettings.settingKey,
        set: { settingValue: value, lastUpdated: sql`now()` }
      });
  }

  async getLastMonthlyResetDate(): Promise<string | null> {
    return this.getSystemSetting('last_monthly_reset_date');
  }

  async setLastMonthlyResetDate(date: string): Promise<void> {
    return this.setSystemSetting('last_monthly_reset_date', date);
  }
}

export const storage = new DatabaseStorage();
