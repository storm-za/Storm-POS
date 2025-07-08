import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPosProductSchema, 
  insertPosCustomerSchema, 
  insertPosSaleSchema,
  insertPosOpenAccountSchema 
} from "@shared/schema";
import { sendContactSubmissionEmail } from "./email";
import { z } from "zod";

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

  // POS Authentication
  app.post("/api/pos/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getPosUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In production, you'd use proper session management here
      res.json({ 
        success: true, 
        user: { id: user.id, email: user.email, paid: user.paid }
      });
    } catch (error) {
      console.error("POS login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POS Products
  app.get("/api/pos/products", async (req, res) => {
    try {
      // For demo, use user ID 1
      const products = await storage.getPosProducts(1);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/pos/products", async (req, res) => {
    try {
      const validatedData = insertPosProductSchema.parse({
        ...req.body,
        userId: 1 // Demo user
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
      const validatedData = insertPosProductSchema.parse({
        ...req.body,
        userId: 1 // Demo user
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
      const customers = await storage.getPosCustomers(1);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/pos/customers", async (req, res) => {
    try {
      const validatedData = insertPosCustomerSchema.parse({
        ...req.body,
        userId: 1
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
      const validatedData = insertPosCustomerSchema.parse({
        ...req.body,
        userId: 1
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
      const sales = await storage.getPosSales(1);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/pos/sales", async (req, res) => {
    try {
      const saleData = {
        ...req.body,
        userId: 1
      };
      
      const validatedData = insertPosSaleSchema.parse(saleData);
      
      // Get all products first to avoid async issues
      const products = await storage.getPosProducts(1);
      
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
      
      // Create the sale
      const sale = await storage.createPosSale(validatedData);
      
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
      const userId = 1; // Demo user ID
      const openAccounts = await storage.getPosOpenAccounts(userId);
      res.json(openAccounts);
    } catch (error) {
      console.error("Error fetching open accounts:", error);
      res.status(500).json({ message: "Failed to fetch open accounts" });
    }
  });

  app.post("/api/pos/open-accounts", async (req, res) => {
    try {
      const validatedData = insertPosOpenAccountSchema.parse({
        ...req.body,
        userId: 1, // Demo user ID
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
      const updatedAccount = await storage.addItemToPosOpenAccount(accountId, req.body);
      if (!updatedAccount) {
        return res.status(404).json({ message: "Open account not found" });
      }
      res.json(updatedAccount);
    } catch (error) {
      console.error("Error adding item to open account:", error);
      res.status(500).json({ message: "Failed to add item to open account" });
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

  const httpServer = createServer(app);
  return httpServer;
}
