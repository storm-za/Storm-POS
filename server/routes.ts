import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPosProductSchema, 
  insertPosCustomerSchema, 
  insertPosSaleSchema,
  insertPosOpenAccountSchema,
  signupPosUserSchema
} from "@shared/schema";
import { sendContactSubmissionEmail } from "./email";
import { z } from "zod";
import * as bcrypt from "bcrypt";

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
      
      // Create new user with paid = true by default
      const newUser = await storage.createPosUser({
        ...validatedData,
        paid: true,
        companyLogo: null
      });
      
      res.json({ 
        success: true, 
        message: "Account created successfully! You can now sign in.",
        user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, companyName: newUser.companyName }
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
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In production, you'd use proper session management here
      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, paid: user.paid, companyLogo: user.companyLogo, companyName: user.companyName }
      });
    } catch (error) {
      console.error("POS login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Update user company logo
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
      const validatedData = insertPosProductSchema.parse({
        ...productData,
        userId: userId || 1
      });
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
      const validatedData = insertPosProductSchema.parse({
        ...productData,
        userId: userId || 1
      });
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
      
      // Automatically increment user usage by 1% of sale total
      try {
        const saleTotal = parseFloat(validatedData.total);
        const usageAmount = (saleTotal * 0.01).toFixed(2); // 1% of sale total
        await storage.incrementUserUsage(userIdToUse, usageAmount);
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

  // Initialize monthly reset scheduler (but don't run immediately)
  console.log("📅 Monthly usage reset scheduler initialized - will check every hour for 1st day of month");

  const httpServer = createServer(app);
  return httpServer;
}
