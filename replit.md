# Storm SaaS Website

## Overview

Storm is a modern SaaS platform built for a South African software company offering web development services and a complete POS (Point of Sale) system. The application includes both a high-converting marketing website for lead generation and a fully functional cloud-based POS system for retailers.

## System Architecture

The application follows a full-stack TypeScript architecture with:

- **Frontend**: React with Vite for fast development and building
- **Backend**: Express.js server with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Database**: PostgreSQL with Drizzle ORM (configured for production)
- **Development Storage**: In-memory storage for development environment
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **Component System**: shadcn/ui components with Radix UI primitives
- **Animation**: Framer Motion for smooth animations and transitions
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom Storm brand colors and glassmorphism effects
- **Icons**: Lucide React icons with custom SVG illustrations

### Backend Architecture
- **API Layer**: RESTful Express.js server with TypeScript
- **Data Layer**: Drizzle ORM with PostgreSQL schema
- **Storage Interface**: Abstracted storage layer with both memory and database implementations
- **Middleware**: Request logging, JSON parsing, and error handling

### Database Schema
Main website tables:
- **users**: Basic user authentication (id, username, password)
- **contact_submissions**: Lead capture form data (business details, project requirements, timeline)

POS System tables:
- **pos_users**: POS user accounts (id, email, password, paid status)
- **pos_products**: Product inventory (id, sku, name, price, quantity, user_id)
- **pos_customers**: Customer directory (id, name, phone, notes, user_id)
- **pos_sales**: Sales transactions (id, total, items, customer_name, payment_type, user_id)

## Data Flow

### Website Flow
1. **Homepage Flow**: Users land on homepage with hero section and three service cards
2. **Web Development Page**: Main conversion page with detailed service information and contact form
3. **Contact Form Submission**: Form data validated with Zod, stored in database, confirmation sent to user
4. **Lead Management**: Contact submissions stored for admin review via API endpoint

### POS System Flow
1. **POS Landing Page** (/pos): Marketing page for Storm POS with pricing tiers
2. **Authentication** (/pos/login): Secure login with email/password, subscription status validation
3. **Main Dashboard** (/pos/system): Full POS interface with sales, products, customers, and reports
4. **Sales Processing**: Real-time inventory updates, payment processing, receipt generation
5. **Subscription Control**: Paid users access full system, unpaid users see inactive screen

## POS System Features

### Core Functionality
- **All Device Design**: Optimized for smartphones, tablets, and desktops
- **Real-Time Sales**: Add products to cart, apply discounts, process payments
- **Inventory Management**: Track products with SKU, pricing, and stock levels
- **Customer Directory**: Store customer information and purchase history
- **Multiple Payment Types**: Cash, card, and SnapScan support

### Pricing Tiers
- **Basic (R900/month)**: 1 user, 100 products, basic reporting
- **Growth (R1500/month)**: 3 users, unlimited products, advanced reporting
- **Pro (R6500/month)**: 15 users, premium reporting, expense tracking

### Demo Account
- **Email**: demo@storm.co.za
- **Password**: demo123
- **Status**: Paid subscription (full access)
- **Sample Data**: 6 products (coffee shop items), 2 customers

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (production)
- **drizzle-orm**: Type-safe database ORM
- **@radix-ui/***: Headless UI component primitives
- **framer-motion**: Animation library
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling
- **zod**: Schema validation

### Development Tools
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development
- Runs on port 5000 using `npm run dev`
- Uses in-memory storage for contact submissions
- Hot module replacement with Vite
- Development error overlay

### Production
- Builds static assets with Vite to `dist/public`
- Bundles server with esbuild to `dist/index.js`
- Serves static files from Express
- Uses PostgreSQL database via DATABASE_URL environment variable
- Deploys to Replit with autoscale deployment target

### Database Migration
- Drizzle Kit handles schema migrations
- `npm run db:push` applies schema changes
- Schema defined in `shared/schema.ts`

## Changelog
- June 27, 2025. Initial setup
- June 27, 2025. Removed download checklist button from contact form
- June 27, 2025. Added email functionality for contact submissions to stormmailcompany@gmail.com
- June 27, 2025. Fixed navigation scroll-to-top behavior for page transitions
- June 27, 2025. Updated "Get Started" buttons to scroll to solutions section instead of navigating away
- June 28, 2025. Removed "Follow Us" social media section from footer component
- June 28, 2025. Added /sitemap.xml endpoint for Google Search Console integration
- June 29, 2025. Implemented complete POS (Point of Sale) system with:
  - POS landing page with pricing tiers (R199, R349, R499/month)
  - Secure authentication with subscription status validation
  - Full-featured POS dashboard with sales, products, customers, and reports
  - All device responsive design optimized for touch devices
  - Real-time inventory management and sales processing
  - Demo account (demo@storm.co.za/demo123) with sample coffee shop data
  - Updated homepage to showcase available POS system
- July 7, 2025. Enhanced POS system with advanced product management:
  - Added complete product CRUD (Create, Read, Update, Delete) functionality
  - Implemented product search bar for filtering by name or SKU
  - Added product management dialog with form validation
  - Enhanced product list with edit/delete buttons and low stock warnings
  - Added API endpoints for product operations (POST, PUT, DELETE)
- July 7, 2025. Added complete customer CRUD functionality:
  - Customer management with Create, Read, Update, Delete operations
  - Customer form dialog with name, phone, and notes fields
  - API endpoints for all customer operations
  - Edit and delete buttons for each customer
- July 7, 2025. Enhanced reports with detailed analytics and charts:
  - Replaced basic reports with comprehensive sales analytics dashboard
  - Added date filter for viewing sales data by specific date
  - Implemented interactive charts: pie chart for payment methods, line chart for 7-day trend
  - Added summary cards showing total revenue, transactions, average transaction value
  - Detailed sales list with transaction breakdown and customer information
  - Updated payment options: replaced SnapScan with EFT (Cash, Card, EFT)
- July 7, 2025. Implemented customer dropdown selection system:
  - Replaced customer name input with dropdown showing all customers
  - Customer details (name, phone, notes) displayed in dropdown and below when selected
  - Enhanced checkout flow with customer information preview
- July 7, 2025. Migrated to PostgreSQL database for data persistence:
  - Replaced in-memory storage with PostgreSQL database
  - Sales data now persists across server restarts and sessions
  - Demo account and sample data properly maintained in database
  - Fixed issue where sales reports showed 0 after restart
- August 1, 2025. Implemented comprehensive staff account system:
  - Added staff account management with role-based access control
  - Staff users limited to Sales, Customers, and Open Accounts tabs
  - Management password (manager123) required for Products and Reports access
  - Staff information tracked on all sales transactions and receipts
  - Security fixes for proper staff authentication using Drizzle ORM
  - PDF receipts now display "Served by: [Staff Name]" information
  - Removed "STORM POS" header from receipts for cleaner appearance
- August 1, 2025. Implemented void sale functionality:
  - Added void buttons to each sale in the Reports section
  - Management users can void sales with reason tracking
  - Voided sales are visually distinguished with red styling and strikethrough
  - Void reasons are stored and can be viewed via "View" button
  - Sales figures exclude voided sales from revenue calculations
  - Updated database schema with isVoided, voidReason, voidedAt, voidedBy fields
  - API endpoint for voiding sales with proper authorization checks
- August 1, 2025. Enhanced sales history with staff information:
  - Added "Served by" display to each sale showing staff member or manager name
  - Sales made by staff accounts show the staff member's display name
  - Sales made by main user/manager show manager username or "Manager"
  - Staff information clearly visible in Reports section for accountability
- August 1, 2025. Implemented tip option functionality for waiters:
  - Added tip option toggle underneath discount section in sales interface
  - Added separate tip option toggle in open account dialog for "Close & Pay" operations
  - When enabled, receipts include fillable tip lines: "Tip: _______" and "New Total: _______"
  - Quick Print receipts (for kitchen orders) do not include tip lines as they're not customer-facing
  - Tip options reset after each sale/account closure to prevent unintended usage
  - Fixed closure issue where open account tip state wasn't being captured correctly
  - Designed for pen-and-paper tip collection to make it easy for wait staff to receive tips

## User Preferences

Preferred communication style: Simple, everyday language.