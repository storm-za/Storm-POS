import { 
  users, contactSubmissions, posUsers, posProducts, posCustomers, posSales,
  type User, type InsertUser, type ContactSubmission, type InsertContactSubmission,
  type PosUser, type InsertPosUser, type PosProduct, type InsertPosProduct,
  type PosCustomer, type InsertPosCustomer, type PosSale, type InsertPosSale
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  // POS Operations
  getPosUser(id: number): Promise<PosUser | undefined>;
  getPosUserByEmail(email: string): Promise<PosUser | undefined>;
  createPosUser(user: InsertPosUser): Promise<PosUser>;
  
  getPosProducts(userId: number): Promise<PosProduct[]>;
  createPosProduct(product: InsertPosProduct): Promise<PosProduct>;
  updatePosProduct(id: number, product: Partial<PosProduct>): Promise<PosProduct | undefined>;
  deletePosProduct(id: number): Promise<boolean>;
  
  getPosCustomers(userId: number): Promise<PosCustomer[]>;
  createPosCustomer(customer: InsertPosCustomer): Promise<PosCustomer>;
  updatePosCustomer(id: number, customer: Partial<PosCustomer>): Promise<PosCustomer | undefined>;
  deletePosCustomer(id: number): Promise<boolean>;
  
  getPosSales(userId: number): Promise<PosSale[]>;
  createPosSale(sale: InsertPosSale): Promise<PosSale>;
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
  private currentPosUserId: number;
  private currentPosProductId: number;
  private currentPosCustomerId: number;
  private currentPosSaleId: number;

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
    this.currentPosUserId = 1;
    this.currentPosProductId = 1;
    this.currentPosCustomerId = 1;
    this.currentPosSaleId = 1;
    
    // Create demo POS user and data
    this.createDemoPosUser();
    setTimeout(() => this.createDemoData(), 0);
  }
  
  private async createDemoPosUser() {
    const demoUser: PosUser = {
      id: 1,
      email: "demo@storm.co.za",
      password: "demo123", // In production, this should be hashed
      paid: true,
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
  async getPosUser(id: number): Promise<PosUser | undefined> {
    return this.posUsers.get(id);
  }

  async getPosUserByEmail(email: string): Promise<PosUser | undefined> {
    return Array.from(this.posUsers.values()).find(user => user.email === email);
  }

  async createPosUser(insertUser: InsertPosUser): Promise<PosUser> {
    const id = this.currentPosUserId++;
    const user: PosUser = {
      id,
      email: insertUser.email,
      password: insertUser.password,
      paid: insertUser.paid || false,
      createdAt: new Date(),
    };
    this.posUsers.set(id, user);
    return user;
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
      total: insertSale.total,
      items: insertSale.items,
      customerName: insertSale.customerName || null,
      notes: insertSale.notes || null,
      paymentType: insertSale.paymentType,
      createdAt: new Date(),
    };
    this.posSales.set(id, sale);
    return sale;
  }
}

export const storage = new MemStorage();
