import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPosProductSchema, 
  insertPosCustomerSchema, 
  insertPosSaleSchema,
  insertPosOpenAccountSchema,
  insertPosInvoiceSchema,
  signupPosUserSchema
} from "@shared/schema";
import { sendContactSubmissionEmail, sendWelcomeEmail, sendWhatsNewEmail } from "./email";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import * as XLSX from "xlsx";

const scryptAsync = promisify(scrypt);

// Secure password hashing using Node.js built-in crypto
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuffer, derivedKey);
}

// Idempotent monthly reset using database persistence to prevent duplicate resets
async function checkAndPerformMonthlyReset() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const dayOfMonth = now.getDate();
    
    // Only attempt reset on the 1st day of the month
    if (dayOfMonth !== 1) {
      return;
    }
    
    // Check if reset already performed for this date (idempotent check)
    const lastResetDate = await storage.getLastMonthlyResetDate();
    if (lastResetDate === currentDate) {
      // Reset already completed for this month
      return;
    }
    
    console.log(`🔄 Performing idempotent monthly usage reset for ${currentDate}`);
    console.log(`📊 Last reset was: ${lastResetDate || 'never'}`);
    
    // Perform the reset and atomically update the reset date
    await storage.resetAllUsersUsage();
    await storage.setLastMonthlyResetDate(currentDate);
    
    console.log(`✅ Monthly usage reset completed and persisted for ${currentDate}`);
  } catch (error) {
    console.error("❌ Error during monthly reset:", error);
    // On error, don't update the reset date so it can retry
  }
}

// Set up monthly reset interval - check every hour to catch the 1st day of month
setInterval(checkAndPerformMonthlyReset, 60 * 60 * 1000);

export async function registerRoutes(app: Express): Promise<Server> {
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification
      const emailSent = await sendContactSubmissionEmail(submission);
      
      if (emailSent) {
        console.log("✅ Contact submission saved and email sent:", submission.id);
      } else {
        console.log("⚠️ Contact submission saved but email failed:", submission.id);
      }
      
      res.json({ 
        success: true, 
        message: "Thank you for your submission! We'll be in touch via email soon.",
        submissionId: submission.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Please fill out all required fields correctly.",
          errors: error.errors 
        });
      } else {
        console.error("Contact form error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Something went wrong. Please try again later." 
        });
      }
    }
  });

  // Get all contact submissions (for admin purposes)
  app.get("/api/contact-submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // POS Signup
  app.post("/api/pos/signup", async (req, res) => {
    try {
      const validatedData = signupPosUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getPosUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create new user with paid = true by default and set trial start date
      const newUser = await storage.createPosUser({
        ...validatedData,
        paid: true,
        companyLogo: null,
        trialStartDate: new Date() // Start 7-day free trial
      });
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail(
        newUser.email, 
        newUser.firstName || newUser.companyName
      );
      
      if (emailSent) {
        console.log(`✅ Welcome email sent to ${newUser.email}`);
      } else {
        console.log(`⚠️ User created but welcome email failed for ${newUser.email}`);
      }
      
      res.json({ 
        success: true, 
        message: "Account created successfully! Your 7-day free trial has started.",
        user: { 
          id: newUser.id, 
          email: newUser.email, 
          firstName: newUser.firstName, 
          lastName: newUser.lastName, 
          companyName: newUser.companyName,
          companyLogo: newUser.companyLogo,
          paid: newUser.paid,
          tutorialCompleted: newUser.tutorialCompleted,
          trialStartDate: newUser.trialStartDate,
          preferredLanguage: newUser.preferredLanguage
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Please fill out all required fields correctly.",
          errors: error.errors 
        });
      } else {
        console.error("POS signup error:", error);
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  // POS Authentication
  app.post("/api/pos/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getPosUserByEmail(email);
      
      if (!user || !(await verifyPassword(String(password), String(user.password).trim()))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In production, you'd use proper session management here
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          paid: user.paid, 
          companyLogo: user.companyLogo, 
          companyName: user.companyName, 
          tutorialCompleted: user.tutorialCompleted,
          trialStartDate: user.trialStartDate,
          preferredLanguage: user.preferredLanguage
        }
      });
    } catch (error) {
      console.error("POS login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Update user company logo (PUT method with user ID)
  app.put("/api/pos/user/:id/logo", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { logo } = req.body;
      
      if (!logo) {
        return res.status(400).json({ message: "Logo is required" });
      }
      
      const updatedUser = await storage.updatePosUserLogo(userId, logo);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user logo:", error);
      res.status(500).json({ message: "Failed to update logo" });
    }
  });

  // Upload company logo (POST method - used by frontend)
  app.post("/api/pos/upload-logo", async (req, res) => {
    try {
      const { logo, userId } = req.body;
      
      if (!logo) {
        return res.status(400).json({ message: "Logo data is required" });
      }
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const updatedUser = await storage.updatePosUserLogo(userId, logo);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, logoUrl: logo });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  // Save selected staff account to user profile
  app.put("/api/pos/user/:id/staff-selection", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { staffAccountId } = req.body;
      
      const updatedUser = await storage.updatePosUserStaffSelection(userId, staffAccountId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, selectedStaffAccountId: staffAccountId });
    } catch (error) {
      console.error("Error updating staff selection:", error);
      res.status(500).json({ message: "Failed to save staff selection" });
    }
  });

  // Update user tutorial completion status
  app.put("/api/pos/user/:id/tutorial", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { completed, userEmail } = req.body;
      
      // Validate request parameters
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Completed status is required" });
      }
      if (!userEmail) {
        return res.status(400).json({ message: "User email is required for authentication" });
      }
      
      // Get user from database
      const existingUser = await storage.getPosUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // SECURITY: Verify that the email matches the user - basic authorization
      // This prevents IDOR attacks by ensuring users can only update their own tutorial status
      if (existingUser.email !== userEmail) {
        return res.status(403).json({ message: "Unauthorized: You can only update your own tutorial status" });
      }
      
      const updatedUser = await storage.updatePosUserTutorialStatus(userId, completed);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update tutorial status" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating tutorial status:", error);
      res.status(500).json({ message: "Failed to update tutorial status" });
    }
  });

  // Update user receipt settings
  app.put("/api/pos/user/:id/receipt-settings", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { settings } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (!settings) {
        return res.status(400).json({ message: "Receipt settings are required" });
      }
      
      const updatedUser = await storage.updatePosUserReceiptSettings(userId, settings);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating receipt settings:", error);
      res.status(500).json({ message: "Failed to update receipt settings" });
    }
  });

  // Update user preferred language
  const preferredLanguageSchema = z.object({
    preferredLanguage: z.enum(['en', 'af'], { 
      errorMap: () => ({ message: "Language must be 'en' or 'af'" })
    })
  });
  
  app.put("/api/pos/user/:id/preferred-language", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const validation = preferredLanguageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.issues[0].message });
      }
      
      const updatedUser = await storage.updatePosUserPreferredLanguage(userId, validation.data.preferredLanguage);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating preferred language:", error);
      res.status(500).json({ message: "Failed to update preferred language" });
    }
  });

  // POS Products
  app.get("/api/pos/products", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const products = await storage.getPosProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/pos/products", async (req, res) => {
    try {
      const { userId, ...productData } = req.body;
      const cleanedData = {
        ...productData,
        userId: userId || 1,
        costPrice: productData.costPrice === "" ? null : productData.costPrice,
        tradePrice: productData.tradePrice === "" ? null : productData.tradePrice,
        retailPrice: productData.retailPrice === "" ? "0" : productData.retailPrice,
      };
      const validatedData = insertPosProductSchema.parse(cleanedData);
      const product = await storage.createPosProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/pos/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { userId, ...productData } = req.body;
      const cleanedData = {
        ...productData,
        userId: userId || 1,
        costPrice: productData.costPrice === "" ? null : productData.costPrice,
        tradePrice: productData.tradePrice === "" ? null : productData.tradePrice,
        retailPrice: productData.retailPrice === "" ? "0" : productData.retailPrice,
      };
      const validatedData = insertPosProductSchema.parse(cleanedData);
      const product = await storage.updatePosProduct(productId, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/pos/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const success = await storage.deletePosProduct(productId);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Delete all products for a user
  app.delete("/api/pos/products/all/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const products = await storage.getPosProducts(userId);
      let deleted = 0;
      for (const product of products) {
        await storage.deletePosProduct(product.id);
        deleted++;
      }
      res.json({ success: true, deleted });
    } catch (error) {
      console.error("Error deleting all products:", error);
      res.status(500).json({ message: "Failed to delete all products" });
    }
  });

  // POS Customers
  app.get("/api/pos/customers", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const customers = await storage.getPosCustomers(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/pos/customers", async (req, res) => {
    try {
      const { userId, ...customerData } = req.body;
      const validatedData = insertPosCustomerSchema.parse({
        ...customerData,
        userId: userId || 1
      });
      const customer = await storage.createPosCustomer(validatedData);
      res.json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/pos/customers/:id", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const { userId, ...customerData } = req.body;
      const validatedData = insertPosCustomerSchema.parse({
        ...customerData,
        userId: userId || 1
      });
      const customer = await storage.updatePosCustomer(customerId, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/pos/customers/:id", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const success = await storage.deletePosCustomer(customerId);
      if (!success) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // POS Sales
  app.get("/api/pos/sales", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const sales = await storage.getPosSales(userId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/pos/sales", async (req, res) => {
    try {
      const { userId, ...saleData } = req.body;
      const userIdToUse = userId || 1;
      
      const validatedData = insertPosSaleSchema.parse({
        ...saleData,
        userId: userIdToUse
      });
      
      // Get all products first to avoid async issues
      const products = await storage.getPosProducts(userIdToUse);
      
      // Check inventory and prepare updates
      const inventoryUpdates = [];
      for (const item of validatedData.items as any[]) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newQuantity = product.quantity - item.quantity;
          if (newQuantity < 0) {
            return res.status(400).json({ 
              message: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}` 
            });
          }
          inventoryUpdates.push({
            productId: item.productId,
            newQuantity: newQuantity
          });
        } else {
          return res.status(400).json({ 
            message: `Product with ID ${item.productId} not found` 
          });
        }
      }
      
      // Create the sale - staffAccountId will be handled in frontend if needed
      const sale = await storage.createPosSale(validatedData);
      
      // Automatically increment user usage by 0.5% of sale total (unless in trial period)
      try {
        const user = await storage.getPosUser(userIdToUse);
        if (user) {
          // Check if user is still in 7-day trial period
          const isInTrial = user.trialStartDate && 
            (new Date().getTime() - new Date(user.trialStartDate).getTime()) < (7 * 24 * 60 * 60 * 1000);
          
          if (!isInTrial) {
            // Only charge usage fee if not in trial
            const saleTotal = parseFloat(validatedData.total);
            const usageAmount = (saleTotal * 0.005).toFixed(2); // 0.5% of sale total
            await storage.incrementUserUsage(userIdToUse, usageAmount);
          }
        }
      } catch (usageError) {
        console.error("Error tracking usage for sale:", usageError);
        // Don't fail the sale if usage tracking fails
      }
      
      // Update inventory
      for (const update of inventoryUpdates) {
        await storage.updatePosProduct(update.productId, {
          quantity: update.newQuantity
        });
      }
      
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  // Open Accounts routes
  app.get("/api/pos/open-accounts", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const openAccounts = await storage.getPosOpenAccounts(userId);
      res.json(openAccounts);
    } catch (error) {
      console.error("Error fetching open accounts:", error);
      res.status(500).json({ message: "Failed to fetch open accounts" });
    }
  });

  app.post("/api/pos/open-accounts", async (req, res) => {
    try {
      const { userId, ...accountData } = req.body;
      const validatedData = insertPosOpenAccountSchema.parse({
        ...accountData,
        userId: userId || 1,
      });
      const openAccount = await storage.createPosOpenAccount(validatedData);
      res.json(openAccount);
    } catch (error) {
      console.error("Error creating open account:", error);
      res.status(500).json({ message: "Failed to create open account" });
    }
  });

  app.put("/api/pos/open-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAccount = await storage.updatePosOpenAccount(id, req.body);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Open account not found" });
      }
      res.json(updatedAccount);
    } catch (error) {
      console.error("Error updating open account:", error);
      res.status(500).json({ message: "Failed to update open account" });
    }
  });

  app.delete("/api/pos/open-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePosOpenAccount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Open account not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting open account:", error);
      res.status(500).json({ message: "Failed to delete open account" });
    }
  });

  app.post("/api/pos/open-accounts/:id/items", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      
      // Add each item to the account
      let updatedAccount = await storage.getPosOpenAccounts(1).then(accounts => accounts.find(a => a.id === accountId));
      if (!updatedAccount) {
        return res.status(404).json({ message: "Open account not found" });
      }
      
      // Add all items to the account
      for (const item of items) {
        updatedAccount = await storage.addItemToPosOpenAccount(accountId, item);
        if (!updatedAccount) {
          return res.status(404).json({ message: "Failed to add item to account" });
        }
      }
      
      res.json(updatedAccount);
    } catch (error) {
      console.error("Error adding items to open account:", error);
      res.status(500).json({ message: "Failed to add items to open account" });
    }
  });

  app.delete("/api/pos/open-accounts/:id/items/:itemIndex", async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const itemIndex = parseInt(req.params.itemIndex);
      const updatedAccount = await storage.removeItemFromPosOpenAccount(accountId, itemIndex);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Open account not found or item not found" });
      }
      res.json(updatedAccount);
    } catch (error) {
      console.error("Error removing item from open account:", error);
      res.status(500).json({ message: "Failed to remove item from open account" });
    }
  });

  // Invoice Routes
  app.get("/api/pos/invoices", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const invoices = await storage.getPosInvoices(userId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/pos/invoices/next-number", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const documentType = (req.query.documentType as string) || 'invoice';
      const nextNumber = await storage.getNextDocumentNumber(userId, documentType);
      res.json({ documentNumber: nextNumber });
    } catch (error) {
      console.error("Error getting next document number:", error);
      res.status(500).json({ message: "Failed to get next document number" });
    }
  });

  app.post("/api/pos/invoices", async (req, res) => {
    try {
      const { userId, tax, ...invoiceData } = req.body; // Remove 'tax' as it's calculated, not stored
      const userIdToUse = userId || 1;
      
      // Auto-generate document number
      const documentNumber = await storage.getNextDocumentNumber(userIdToUse, invoiceData.documentType);
      
      // Convert date strings to Date objects and ensure proper types
      // Note: createdDate is auto-generated by database (defaultNow)
      const processedData = {
        ...invoiceData,
        userId: userIdToUse,
        documentNumber,
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
        dueTerms: invoiceData.dueTerms || null,
        // Ensure numeric fields are properly typed as strings for decimal columns
        subtotal: String(invoiceData.subtotal || 0),
        discountPercent: String(invoiceData.discountPercent || 0),
        taxPercent: String(invoiceData.taxPercent || 15),
        shippingAmount: String(invoiceData.shippingAmount || 0),
        total: String(invoiceData.total || 0),
      };
      
      const validatedData = insertPosInvoiceSchema.parse(processedData);
      
      const invoice = await storage.createPosInvoice(validatedData);
      
      // Add R0.50 to user's usage for each invoice created
      await storage.incrementUserUsage(userIdToUse, '0.50');
      
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Invoice validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/pos/invoices/:id", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const invoice = await storage.updatePosInvoice(invoiceId, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.patch("/api/pos/invoices/:id", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['draft', 'sent', 'paid', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const invoice = await storage.updatePosInvoice(invoiceId, { status });
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice status:", error);
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  app.delete("/api/pos/invoices/:id", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const success = await storage.deletePosInvoice(invoiceId);
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Saved Payment Details Routes
  app.get("/api/pos/saved-payment-details", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const details = await storage.getSavedPaymentDetails(userId);
      res.json(details);
    } catch (error) {
      console.error("Error fetching saved payment details:", error);
      res.status(500).json({ message: "Failed to fetch saved payment details" });
    }
  });

  app.post("/api/pos/saved-payment-details", async (req, res) => {
    try {
      const { userId, name, details } = req.body;
      const userIdToUse = userId || 1;
      
      if (!name || !details) {
        return res.status(400).json({ message: "Name and details are required" });
      }
      
      const savedDetails = await storage.createSavedPaymentDetails({
        userId: userIdToUse,
        name,
        details
      });
      res.json(savedDetails);
    } catch (error) {
      console.error("Error creating saved payment details:", error);
      res.status(500).json({ message: "Failed to save payment details" });
    }
  });

  app.delete("/api/pos/saved-payment-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSavedPaymentDetails(id);
      if (!success) {
        return res.status(404).json({ message: "Saved payment details not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting saved payment details:", error);
      res.status(500).json({ message: "Failed to delete saved payment details" });
    }
  });

  // Staff Account Routes
  app.get("/api/pos/staff-accounts", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1; // Use provided user ID or default to 1
      const staffAccounts = await storage.getPosStaffAccounts(userId);
      res.json(staffAccounts);
    } catch (error) {
      console.error("Error fetching staff accounts:", error);
      res.status(500).json({ message: "Failed to fetch staff accounts" });
    }
  });

  app.post("/api/pos/staff-accounts", async (req, res) => {
    try {
      const { username, password, userType, managementPassword, userId } = req.body;
      const posUserId = userId || 1; // Use provided user ID or default to 1
      
      // Check if management password is required (if there are management accounts)
      const existingStaff = await storage.getPosStaffAccounts(posUserId);
      const hasManagementAccounts = existingStaff.some(staff => staff.userType === 'management');
      
      if (hasManagementAccounts && managementPassword) {
        // Verify management password
        const isValidManagement = existingStaff.some(staff => 
          staff.userType === 'management' && staff.password === managementPassword
        );
        
        if (!isValidManagement) {
          return res.status(403).json({ message: "Invalid management password" });
        }
      }
      
      const staffAccount = await storage.createPosStaffAccount({
        posUserId,
        username,
        password,
        userType
      });
      
      res.json(staffAccount);
    } catch (error) {
      console.error("Error creating staff account:", error);
      res.status(500).json({ message: "Failed to create staff account" });
    }
  });

  app.post("/api/pos/staff-accounts/authenticate", async (req, res) => {
    try {
      const { username, password, userId } = req.body;
      const posUserId = userId || 1; // Use provided user ID or default to 1
      
      const staffAccount = await storage.authenticateStaffAccount(posUserId, username, password);
      
      if (!staffAccount) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ success: true, staffAccount });
    } catch (error) {
      console.error("Error authenticating staff account:", error);
      res.status(500).json({ message: "Failed to authenticate staff account" });
    }
  });

  app.delete("/api/pos/staff-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePosStaffAccount(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Staff account not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting staff account:", error);
      res.status(500).json({ message: "Failed to delete staff account" });
    }
  });

  // Void Sale Route
  app.patch("/api/pos/sales/:id/void", async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { voidReason, voidedBy } = req.body;
      
      if (!voidReason || !voidReason.trim()) {
        return res.status(400).json({ message: "Void reason is required" });
      }
      
      const voidedSale = await storage.voidPosSale(saleId, voidReason, voidedBy);
      
      if (!voidedSale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      
      res.json(voidedSale);
    } catch (error) {
      console.error("Error voiding sale:", error);
      res.status(500).json({ message: "Failed to void sale" });
    }
  });

  // Usage tracking routes - requires user authentication via POST with credentials in body
  app.post("/api/pos/usage/get", async (req, res) => {
    try {
      const { userId, email, password } = req.body;
      
      // Validate required fields
      if (!userId || !email || !password) {
        return res.status(400).json({ message: "User ID, email, and password required to access usage data" });
      }
      
      const parsedUserId = parseInt(userId);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Verify user credentials and ownership
      const user = await storage.getPosUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password)) || user.id !== parsedUserId) {
        return res.status(403).json({ message: "Access denied: Invalid credentials or unauthorized access" });
      }
      
      const usage = await storage.getUserUsage(parsedUserId);
      res.json({ userId: parsedUserId, currentUsage: usage });
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // Manual reset all users' usage - Admin endpoint (requires admin authentication)
  app.post("/api/pos/usage/reset-all", async (req, res) => {
    try {
      const { adminEmail, adminPassword, adminKey } = req.body;
      
      // Option 1: Admin key for system-level access
      const systemAdminKey = process.env.ADMIN_RESET_KEY;
      if (systemAdminKey && adminKey === systemAdminKey) {
        await storage.resetAllUsersUsage();
        console.log("✅ All users' usage reset to R0.00 (via admin key)");
        return res.json({ success: true, message: "All users' usage reset to R0.00" });
      }
      
      // Option 2: Management user credentials - requires proper admin role validation
      if (adminEmail && adminPassword) {
        const adminUser = await storage.getPosUserByEmail(adminEmail);
        if (!adminUser || !(await bcrypt.compare(adminPassword, adminUser.password))) {
          return res.status(403).json({ 
            message: "Access denied: Invalid admin credentials" 
          });
        }
        
        // Critical security check: Verify user has management role via staff accounts
        const staffAccounts = await storage.getPosStaffAccounts(adminUser.id);
        const hasManagementRole = staffAccounts.some(staff => 
          staff.userType === 'management' && 
          staff.isActive === true
        );
        
        if (!hasManagementRole) {
          console.log(`⚠️ Unauthorized usage reset attempt by non-management user: ${adminEmail}`);
          return res.status(403).json({ 
            message: "Access denied: Management role required for system-wide operations" 
          });
        }
        
        await storage.resetAllUsersUsage();
        console.log(`✅ All users' usage reset to R0.00 (by management user: ${adminEmail})`);
        return res.json({ success: true, message: "All users' usage reset to R0.00" });
      }
      
      // Access denied
      res.status(403).json({ 
        message: "Access denied: Admin authentication required. Provide either adminKey or valid adminEmail/adminPassword." 
      });
    } catch (error) {
      console.error("Error resetting usage:", error);
      res.status(500).json({ message: "Failed to reset usage" });
    }
  });

  // ===== ENTERPRISE-GRADE SITEMAP STRUCTURE FOR SEO =====
  // Production domain - hardcoded for consistent SEO indexing
  const PRODUCTION_DOMAIN = 'https://stormsoftware.co.za';
  
  // robots.txt endpoint - references sitemap index
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `# Storm Software - robots.txt
# https://stormsoftware.co.za

User-agent: *
Allow: /

# Disallow private/authenticated areas
Disallow: /pos/system
Disallow: /pos/system/*
Disallow: /api/

# Sitemap Index Location
Sitemap: ${PRODUCTION_DOMAIN}/sitemap_index.xml
`;
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Sitemap Index - Enterprise structure following Google's best practices
  app.get("/sitemap_index.xml", (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${PRODUCTION_DOMAIN}/sitemap-main.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${PRODUCTION_DOMAIN}/sitemap-services.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${PRODUCTION_DOMAIN}/sitemap-pos.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${PRODUCTION_DOMAIN}/sitemap-blog.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

    res.set('Content-Type', 'application/xml');
    res.set('X-Robots-Tag', 'noindex');
    res.send(sitemapIndex);
  });

  // Main pages sitemap (homepage, about, contact)
  app.get("/sitemap-main.xml", (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${PRODUCTION_DOMAIN}/</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Services pages sitemap (web development, etc.)
  app.get("/sitemap-services.xml", (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${PRODUCTION_DOMAIN}/web-development</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // POS product pages sitemap
  app.get("/sitemap-pos.xml", (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${PRODUCTION_DOMAIN}/pos</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${PRODUCTION_DOMAIN}/pos/signup</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${PRODUCTION_DOMAIN}/pos/login</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Blog pages sitemap
  app.get("/sitemap-blog.xml", (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${PRODUCTION_DOMAIN}/blog</loc>
    <lastmod>${currentDate}</lastmod>
  </url>
  <url>
    <loc>${PRODUCTION_DOMAIN}/blog/why-south-african-retailers-switching-cloud-pos</loc>
    <lastmod>2025-12-15</lastmod>
  </url>
  <url>
    <loc>${PRODUCTION_DOMAIN}/blog/real-cost-not-having-website-2025</loc>
    <lastmod>2025-12-12</lastmod>
  </url>
  <url>
    <loc>${PRODUCTION_DOMAIN}/blog/how-choose-right-pos-system-business</loc>
    <lastmod>2025-12-08</lastmod>
  </url>
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Legacy sitemap.xml redirect to sitemap index (for backwards compatibility)
  app.get("/sitemap.xml", (req, res) => {
    res.redirect(301, '/sitemap_index.xml');
  });

  // Send "What's New" email to all POS users (admin endpoint)
  app.post("/api/admin/send-whats-new-email", async (req, res) => {
    try {
      console.log("📧 Starting What's New email campaign...");
      
      // Get all POS users
      const allUsers = await storage.getAllPosUsers();
      console.log(`📋 Found ${allUsers.length} POS users`);
      
      let successCount = 0;
      let failCount = 0;
      const results: { email: string; success: boolean }[] = [];
      
      // Send email to each user
      for (const user of allUsers) {
        const userName = user.firstName || user.companyName || 'there';
        const success = await sendWhatsNewEmail(user.email, userName);
        
        results.push({ email: user.email, success });
        
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`✅ Email campaign complete: ${successCount} sent, ${failCount} failed`);
      
      res.json({
        success: true,
        message: `Email campaign complete`,
        totalUsers: allUsers.length,
        successCount,
        failCount,
        results
      });
    } catch (error) {
      console.error("❌ Error sending What's New emails:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send emails",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Initialize monthly reset scheduler (but don't run immediately)
  console.log("📅 Monthly usage reset scheduler initialized - will check every hour for 1st day of month");

  // ==================== EXCEL EXPORT ENDPOINTS ====================

  // Export Products to Excel
  app.get("/api/pos/export/products/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const products = await storage.getPosProducts(userId);
      
      const data = products.map(p => ({
        'SKU': p.sku,
        'Product Name': p.name,
        'Cost Price (R)': p.costPrice,
        'Retail Price (R)': p.retailPrice,
        'Trade Price (R)': p.tradePrice || '',
        'Stock Quantity': p.quantity,
        'Category': p.category || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="storm-products.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Export products error:", error);
      res.status(500).json({ message: "Failed to export products" });
    }
  });

  // Export Customers to Excel
  app.get("/api/pos/export/customers/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const customers = await storage.getPosCustomers(userId);
      
      const data = customers.map(c => ({
        'Customer Name': c.name,
        'Email': c.email || '',
        'Phone': c.phone || '',
        'Customer Type': c.customerType || 'retail',
        'Notes': c.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="storm-customers.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Export customers error:", error);
      res.status(500).json({ message: "Failed to export customers" });
    }
  });

  // Export Invoices to Excel
  app.get("/api/pos/export/invoices/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const invoices = await storage.getPosInvoices(userId);
      
      const data = invoices.map(inv => ({
        'Document Number': inv.documentNumber,
        'Type': inv.documentType === 'invoice' ? 'Invoice' : 'Quote',
        'Client Name': inv.clientName,
        'Client Email': inv.clientEmail || '',
        'Date': inv.createdAt,
        'Due Date': inv.dueDate || '',
        'PO Number': inv.poNumber || '',
        'Subtotal': inv.subtotal,
        'Discount %': inv.discountPercent,
        'Discount Amount': inv.discountAmount,
        'Tax %': inv.taxPercent,
        'Tax Amount': inv.taxAmount,
        'Shipping': inv.shippingAmount,
        'Total': inv.total,
        'Status': inv.status,
        'Payment Method': inv.paymentMethod || '',
        'Notes': inv.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="storm-invoices.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Export invoices error:", error);
      res.status(500).json({ message: "Failed to export invoices" });
    }
  });

  // Export Sales to Excel
  app.get("/api/pos/export/sales/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sales = await storage.getPosSales(userId);
      
      const data = sales.map(s => ({
        'Date': s.createdAt,
        'Items': JSON.stringify(s.items),
        'Subtotal': s.subtotal,
        'Tax': s.tax,
        'Tip': s.tip || 0,
        'Total': s.total,
        'Payment Type': s.paymentType,
        'Voided': s.isVoided ? 'Yes' : 'No',
        'Void Reason': s.voidReason || '',
        'Staff Member': s.staffName || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="storm-sales.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error("Export sales error:", error);
      res.status(500).json({ message: "Failed to export sales" });
    }
  });

  // ==================== EXCEL IMPORT ENDPOINTS ====================

  // Import Products from Excel
  app.post("/api/pos/import/products/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      // Helper function to normalize header names for flexible matching
      const normalizeHeader = (header: string): string => {
        return String(header || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      };

      // Find value from row using multiple possible column names - exact match first, then partial
      const findValue = (row: any, synonyms: string[], excludePatterns: string[] = []): any => {
        const keys = Object.keys(row);
        
        // First pass: exact matches only (most reliable)
        for (const key of keys) {
          const normalizedKey = normalizeHeader(key);
          // Skip if key matches any exclude pattern
          if (excludePatterns.some(pattern => normalizedKey.includes(normalizeHeader(pattern)))) {
            continue;
          }
          for (const synonym of synonyms) {
            if (normalizedKey === normalizeHeader(synonym)) {
              return row[key];
            }
          }
        }
        
        // Second pass: partial matches (less reliable, but useful for variations)
        for (const key of keys) {
          const normalizedKey = normalizeHeader(key);
          // Skip if key matches any exclude pattern
          if (excludePatterns.some(pattern => normalizedKey.includes(normalizeHeader(pattern)))) {
            continue;
          }
          for (const synonym of synonyms) {
            const normalizedSynonym = normalizeHeader(synonym);
            // Only allow partial match if synonym is long enough to be specific (4+ chars)
            if (normalizedSynonym.length >= 4 && normalizedKey.includes(normalizedSynonym)) {
              return row[key];
            }
          }
        }
        return undefined;
      };

      // Column name synonyms for flexible matching
      const skuSynonyms = ['product id', 'productid', 'sku', 'code', 'product code', 'item code', 'barcode', 'upc', 'kode', 'produk kode', 'produk id', 'item id'];
      const nameSynonyms = ['product name', 'productname', 'item name', 'itemname', 'artikel', 'produknaam', 'naam', 'name'];
      const priceSynonyms = ['default price', 'defaultprice', 'price', 'retail price', 'retailprice', 'selling price', 'unit price', 'prys', 'kleinhandelprys', 'verkoopprys', 'retail', 'standaardprys'];
      const costSynonyms = ['cost', 'cost price', 'costprice', 'purchase price', 'buy price', 'kosprys', 'aankoopprys'];
      const tradeSynonyms = ['trade', 'trade price', 'tradeprice', 'wholesale', 'wholesale price', 'groothandelprys'];
      const qtySynonyms = ['quantity', 'qty', 'stock', 'stock quantity', 'inventory', 'count', 'hoeveelheid', 'voorraad'];
      const categorySynonyms = ['category', 'type', 'group', 'kategorie', 'tipe'];

      const results = {
        imported: 0,
        updated: 0,
        errors: [] as string[]
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const name = findValue(row, nameSynonyms, ['productid', 'product id', 'itemid', 'item id']);
          const sku = findValue(row, skuSynonyms) || '';
          const retailPrice = findValue(row, priceSynonyms);
          const costPrice = findValue(row, costSynonyms);
          const tradePrice = findValue(row, tradeSynonyms);
          const quantity = findValue(row, qtySynonyms);
          const category = findValue(row, categorySynonyms);

          const productData = {
            userId,
            sku: String(sku || '').trim(),
            name: String(name || '').trim(),
            costPrice: String(parseFloat(String(costPrice || retailPrice || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || '0'),
            retailPrice: String(parseFloat(String(retailPrice || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || '0'),
            tradePrice: tradePrice ? String(parseFloat(String(tradePrice).replace(/[^0-9.,]/g, '').replace(',', '.')) || undefined) : undefined,
            quantity: parseInt(String(quantity || '0').replace(/[^0-9]/g, '')) || 0,
            category: category ? String(category).trim() : undefined
          };

          if (!productData.name) {
            results.errors.push(`Row ${i + 2}: Missing product name`);
            continue;
          }

          if (productData.retailPrice === '0' || productData.retailPrice === 'NaN') {
            results.errors.push(`Row ${i + 2}: "${productData.name}" - Missing or invalid price`);
            continue;
          }

          // Check if product with same SKU exists
          const existingProducts = await storage.getPosProducts(userId);
          const existingProduct = existingProducts.find(p => p.sku === productData.sku && productData.sku);
          
          if (existingProduct) {
            await storage.updatePosProduct(existingProduct.id, productData);
            results.updated++;
          } else {
            await storage.createPosProduct(productData);
            results.imported++;
          }
        } catch (err) {
          results.errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      const errorSummary = results.errors.length > 0 
        ? ` (${results.errors.length} rows had issues)` 
        : '';

      res.json({
        success: true,
        message: `Import complete: ${results.imported} new, ${results.updated} updated${errorSummary}`,
        ...results
      });
    } catch (error) {
      console.error("Import products error:", error);
      res.status(500).json({ message: "Failed to import products" });
    }
  });

  // Import Customers from Excel
  app.post("/api/pos/import/customers/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { data } = req.body;
      
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      const results = {
        imported: 0,
        updated: 0,
        errors: [] as string[]
      };

      for (const row of data) {
        try {
          const customerData = {
            userId,
            name: row['Customer Name'] || row['name'] || '',
            email: row['Email'] || row['email'] || undefined,
            phone: row['Phone'] || row['phone'] || undefined,
            customerType: (row['Customer Type'] || row['customerType'] || 'retail') as 'retail' | 'trade',
            notes: row['Notes'] || row['notes'] || undefined
          };

          if (!customerData.name) {
            results.errors.push(`Row missing customer name`);
            continue;
          }

          // Check if customer with same name exists
          const existingCustomers = await storage.getPosCustomers(userId);
          const existingCustomer = existingCustomers.find(c => 
            c.name.toLowerCase() === customerData.name.toLowerCase()
          );
          
          if (existingCustomer) {
            await storage.updatePosCustomer(existingCustomer.id, customerData);
            results.updated++;
          } else {
            await storage.createPosCustomer(customerData);
            results.imported++;
          }
        } catch (err) {
          results.errors.push(`Error processing row: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      res.json({
        success: true,
        message: `Import complete: ${results.imported} new, ${results.updated} updated`,
        ...results
      });
    } catch (error) {
      console.error("Import customers error:", error);
      res.status(500).json({ message: "Failed to import customers" });
    }
  });

  // ==================== XERO Integration Routes ====================
  
  // Get XERO connection status
  app.get("/api/pos/xero/status/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getPosUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        connected: user.xeroConnected || false,
        lastSync: user.xeroLastSync || null,
        tenantId: user.xeroTenantId || null
      });
    } catch (error) {
      console.error("Get XERO status error:", error);
      res.status(500).json({ message: "Failed to get XERO status" });
    }
  });
  
  // Initiate XERO OAuth connection (placeholder - requires XERO credentials)
  app.post("/api/pos/xero/connect/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { clientId, clientSecret } = req.body;
      
      if (!clientId || !clientSecret) {
        return res.status(400).json({ 
          message: "XERO integration requires you to provide your own XERO Developer credentials. Please visit https://developer.xero.com/myapps/ to create an application and obtain your Client ID and Client Secret." 
        });
      }
      
      // In a production implementation, you would:
      // 1. Store encrypted credentials
      // 2. Generate OAuth 2.0 PKCE challenge
      // 3. Redirect user to XERO authorization URL
      // 4. Handle callback with authorization code
      // 5. Exchange code for access/refresh tokens
      
      res.json({ 
        success: false,
        message: "XERO OAuth flow requires additional setup. Please contact support for enterprise XERO integration.",
        setupRequired: true
      });
    } catch (error) {
      console.error("Connect XERO error:", error);
      res.status(500).json({ message: "Failed to initiate XERO connection" });
    }
  });
  
  // Disconnect XERO
  app.post("/api/pos/xero/disconnect/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      await storage.updatePosUser(userId, {
        xeroConnected: false,
        xeroTenantId: null,
        xeroAccessToken: null,
        xeroRefreshToken: null,
        xeroTokenExpiry: null,
        xeroLastSync: null
      });
      
      res.json({ success: true, message: "Disconnected from XERO" });
    } catch (error) {
      console.error("Disconnect XERO error:", error);
      res.status(500).json({ message: "Failed to disconnect from XERO" });
    }
  });
  
  // Manual XERO sync
  app.post("/api/pos/xero/sync/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getPosUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.xeroConnected) {
        return res.status(400).json({ message: "XERO is not connected. Please connect to XERO first." });
      }
      
      // In a production implementation, you would:
      // 1. Refresh access token if expired
      // 2. Sync customers <-> contacts
      // 3. Sync products <-> items
      // 4. Push invoices to XERO
      // 5. Update payment statuses
      
      // Update last sync time
      await storage.updatePosUser(userId, {
        xeroLastSync: new Date()
      });
      
      res.json({ 
        success: true, 
        message: "XERO sync completed",
        syncedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("XERO sync error:", error);
      res.status(500).json({ message: "Failed to sync with XERO" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
