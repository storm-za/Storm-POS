# Storm SaaS Website

## Overview

Storm is a modern SaaS website built for a South African software company offering web development services and future POS/pricing automation solutions. The application is designed as a high-converting marketing website with a focus on lead generation through a dedicated web development landing page optimized for Google Ads campaigns.

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
Two main tables:
- **users**: Basic user authentication (id, username, password)
- **contact_submissions**: Lead capture form data (business details, project requirements, timeline)

## Data Flow

1. **Homepage Flow**: Users land on homepage with hero section and three service cards
2. **Web Development Page**: Main conversion page with detailed service information and contact form
3. **Contact Form Submission**: Form data validated with Zod, stored in database, confirmation sent to user
4. **Lead Management**: Contact submissions stored for admin review via API endpoint

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

## User Preferences

Preferred communication style: Simple, everyday language.