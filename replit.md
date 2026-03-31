# Storm SaaS Website

## Overview
Storm is a SaaS platform for a South African software company, offering web development services and a cloud-based Point of Sale (POS) system. It features a marketing website for lead generation and a full-featured POS for retailers, aiming to generate leads and provide a comprehensive business management solution. The platform includes an advanced invoicing and quoting system, and a SEO-optimized blog section.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
- **Design System**: Tailwind CSS with shadcn/ui components, Radix UI primitives.
- **Branding**: Custom Storm brand colors (blue branding using hsl(217,90%,40%)), glassmorphism effects, custom SVG illustrations, Lucide React icons.
- **Animations**: Framer Motion for smooth transitions.
- **Responsive Design**: Optimized for smartphones, tablets, and desktops.
- **Language Support**: Full Afrikaans translation available for the POS system.

### Technical Implementation
- **Full-Stack**: TypeScript-based with React (Vite) for frontend and Express.js for backend.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for client-side navigation.
- **Form Handling**: React Hook Form with Zod validation.
- **Database**: PostgreSQL with Drizzle ORM (in-memory for development).
- **Authentication**: Secure login with email/password, subscription validation for POS.
- **API**: RESTful Express.js server.

### Feature Specifications
- **Marketing Website**: Homepage, Web Development service page, Contact form with lead capture.
- **POS System**:
    - **Core**: Real-time sales, inventory management (CRUD), customer directory (CRUD), multiple payment types (Cash, Card, EFT).
    - **Advanced**: Staff account management with role-based access, void sale functionality with reason tracking, tip options for sales.
    - **Reporting**: Comprehensive sales analytics dashboard with charts, date filters, and transaction breakdowns.
    - **Subscription**: Tiered pricing (Basic, Growth, Pro), demo account available.
- **Invoices & Quotes System**:
    - **Functionality**: Full CRUD for invoices and quotes, automatic numbering, client selection, comprehensive form fields (PO, terms, due date, line items, calculations, payment method, notes, T&Cs).
    - **Management**: Status workflow (Draft, Sent, Paid, Cancelled), search, filter by status, type, date range.
    - **Export**: PDF export with Storm branding and business details (logo, company info).
- **Email System**: Automated welcome emails for new users; bilingual (EN/AF) upsell switch emails sent once per billing month when a percent-plan user's sale fees exceed the flat-plan equivalent cost.
- **Upsell System**: When a user on the 0.5% per-sale plan has paid more in fees than the R1.00/sale flat plan would have cost, a dismissible banner appears in the POS and a one-time monthly email is sent. `PUT /api/pos/user/:id/upgrade-plan` (email-verified) switches percent to flat plan. `currentUsage` tracks sale fees only; invoice fees are separate and apply equally on all plans. `currentSalesCount` and `upsellEmailSentMonth` columns on `posUsers` support this.
- **SVG Illustrations**: Three brand-style inline SVG components in `client/src/components/illustrations/` (MultiDeviceSync, InvoicePreview, ReportingDashboard) use strict black #111 outlines, white fills, and `hsl(217,90%,40%)` spot colour only on value/action elements (sync pulse dots, checkmarks, PAID/DRAFT stamps, logo placeholders, profit figures, trend line, donut arc).
- **Blog**: SEO-optimized blog section with 11 long-form articles targeting SA-specific keywords, internal linking, social sharing, and related posts. Article JSON-LD and BreadcrumbList schema on every post.
- **SEO**: Full technical SEO audit implemented — correct canonical URLs, absolute og:url, Article schema on blog posts, FAQPage schema on Home/Web Development/POS, BreadcrumbList on all key pages, hreflang for English/Afrikaans help pages, dynamic blog sitemap, robots.txt via server (no duplicate static file).

### System Design
- **Data Flow**: Structured flows for website lead capture and comprehensive POS operations (sales, inventory, customers, reports).
- **Deployment**: Vite for frontend assets, esbuild for backend, PostgreSQL for production database, Replit autoscale deployment.
- **Sitemap**: Enterprise-grade sitemap index (`/sitemap_index.xml`) with child sitemaps for different content types (main, services, POS, blog) and `robots.txt` for SEO.

## Desktop App (Tauri)
- **Framework**: Tauri v2 — wraps the web app in a native window (Windows + Android)
- **GitHub Repo**: `https://github.com/storm-za/Storm-POS`
- **Build**: GitHub Actions (`/.github/workflows/release.yml`) — triggered by pushing a `v*` tag; builds Windows and Android in parallel
- **Config**: `src-tauri/tauri.conf.json` — loads `https://stormsoftware.co.za/pos/login`, identifier `za.storm.pos`
- **Auto-updater (Windows)**: Tauri v2 updater plugin — on launch, silently checks `latest.json` at GitHub Releases. If a newer version exists, shows native dialog "Install Now / Later". If accepted, downloads, installs, and restarts automatically. Desktop-only (guarded with `#[cfg(desktop)]`).
- **Android build**: Produces signed `.aab` for Google Play Store upload. Uses Play Store keystore stored in GitHub secrets.
- **Current version**: v1.5.2 (in `src-tauri/tauri.conf.json`)
- **Signing keypair (Windows updater)**: Ed25519 (minisign format, no password). Public key in `tauri.conf.json`. Private key in GitHub secret `TAURI_SIGNING_PRIVATE_KEY`.
- **Android signing**: RSA 2048 keystore stored as `ANDROID_KEYSTORE_BASE64` in GitHub secrets. Alias: `storm-pos`. Password in `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_PASSWORD`. **Must not lose these — Play Store updates require same keystore forever.**
- **Publishing a new version**: Create tag via GitHub API → Actions builds Windows `.exe`/`.msi`/`latest.json` + Android `.aab` → uploaded to GitHub Release → Windows users notified automatically; `.aab` uploaded to Play Store manually
- **latest.json**: Generated by PowerShell step in workflow; required for Windows auto-updater.
- **Download page**: `/pos` landing page has a "Download for Windows" button pointing to `https://github.com/storm-za/Storm-POS/releases/latest`
- **Icons**: Generate with `npx @tauri-apps/cli icon <logo.png>` and place in `src-tauri/icons/`
- **Capabilities**: `src-tauri/capabilities/default.json` — Windows/desktop. `src-tauri/capabilities/mobile.json` — Android.

## External Dependencies

- **Database**: `@neondatabase/serverless` (PostgreSQL), `drizzle-orm`.
- **UI/Components**: `@radix-ui/*` (headless UI), `framer-motion` (animations), `tailwindcss` (CSS framework).
- **State/Forms/Validation**: `@tanstack/react-query`, `react-hook-form`, `zod`.
- **Development/Build Tools**: `Vite`, `tsx`, `esbuild`.