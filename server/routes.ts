import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertContactSubmissionSchema, 
  insertPosProductSchema, 
  insertPosCustomerSchema, 
  insertPosSaleSchema 
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
      const sale = await storage.createPosSale(validatedData);
      
      // Update product quantities
      for (const item of validatedData.items as any[]) {
        const product = await storage.getPosProducts(1).then(products => 
          products.find(p => p.id === item.productId)
        );
        if (product) {
          await storage.updatePosProduct(item.productId, {
            quantity: product.quantity - item.quantity
          });
        }
      }
      
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
