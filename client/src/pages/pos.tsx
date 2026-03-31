import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Check, DeviceMobile as Smartphone, Cloud, TrendUp as TrendingUp,
  Users, ShieldCheck as Shield, RocketLaunch as Zap,
  Table as FileSpreadsheet, FileText, Receipt, ChartBar as BarChart3,
  Package, CreditCard, Globe, Calculator, ChartPie as PieChart,
  UserCircleCheck as UserCheck, Translate as Languages,
  Wallet, ChatCircle as MessageSquare, ShareNetwork as Share2,
  Desktop as Monitor, Star, X, List as Menu
} from "@phosphor-icons/react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1761856744843.png";
import { updatePageSEO } from "@/lib/seo";
import MultiDeviceSync from "@/components/illustrations/MultiDeviceSync";
import InvoicePreview from "@/components/illustrations/InvoicePreview";
import ReportingDashboard from "@/components/illustrations/ReportingDashboard";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Web Dev", href: "/web-development" },
  { label: "Contact", href: "/contact" },
  { label: "About",   href: "/#about" },
];

export default function POS() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    updatePageSEO({
      title: 'Storm POS - Cloud Point of Sale System | 7 Days Free, Pay Only 0.5% Per Sale',
      description: 'The smartest POS system for South African retailers. No monthly fees, no setup costs. Just 0.5% per sale. Try free for 7 days. Always online, works on any device.',
      canonical: 'https://stormsoftware.co.za/pos'
    });

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb');
    breadcrumbScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stormsoftware.co.za/" },
        { "@type": "ListItem", "position": 2, "name": "Storm POS", "item": "https://stormsoftware.co.za/pos" }
      ]
    });
    document.head.appendChild(breadcrumbScript);
    
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "How much does Storm POS cost?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS has no monthly fees or setup costs. You only pay 0.5% per sale plus R0.50 per invoice generated. This means you only pay when you make money." } },
        { "@type": "Question", "name": "Is there a free trial for Storm POS?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS offers a 7-day free trial with full access to all features. No credit card required to start." } },
        { "@type": "Question", "name": "Does Storm POS work offline?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS is a cloud-based system that works on any device with an internet connection. It automatically syncs your data across all your devices in real-time." } },
        { "@type": "Question", "name": "Can I use Storm POS in Afrikaans?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS offers full Afrikaans language support. You can switch between English and Afrikaans at any time in your settings." } },
        { "@type": "Question", "name": "What devices can I use with Storm POS?", "acceptedAnswer": { "@type": "Answer", "text": "Storm POS works on any device with a web browser - tablets, smartphones, laptops, or desktop computers. No special hardware required." } },
        { "@type": "Question", "name": "Can Storm POS generate invoices and quotes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! Storm POS includes a full invoicing and quoting system. Generate professional PDF invoices and quotes with your business branding, then email them directly to customers." } }
      ]
    };
    
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Storm POS",
      "description": "Cloud-based Point of Sale system for South African retailers. Real-time sales tracking, inventory management, invoicing, and comprehensive analytics.",
      "brand": { "@type": "Brand", "name": "Storm Software" },
      "offers": { "@type": "Offer", "priceCurrency": "ZAR", "price": "0", "priceValidUntil": "2027-12-31", "availability": "https://schema.org/InStock", "description": "Pay only 0.5% per sale + R0.50 per invoice. No monthly fees." },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127", "bestRating": "5", "worstRating": "1" }
    };
    
    const existingFaqScript = document.querySelector('script[data-schema="faq"]');
    if (!existingFaqScript) {
      const faqScript = document.createElement('script');
      faqScript.type = 'application/ld+json';
      faqScript.setAttribute('data-schema', 'faq');
      faqScript.textContent = JSON.stringify(faqSchema);
      document.head.appendChild(faqScript);
    }
    
    const existingProductScript = document.querySelector('script[data-schema="product"]');
    if (!existingProductScript) {
      const productScript = document.createElement('script');
      productScript.type = 'application/ld+json';
      productScript.setAttribute('data-schema', 'product');
      productScript.textContent = JSON.stringify(productSchema);
      document.head.appendChild(productScript);
    }
    
    return () => {
      document.querySelector('script[data-schema="faq"]')?.remove();
      document.querySelector('script[data-schema="product"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb"]')?.remove();
    };
  }, []);

  const features = [
    { icon: CreditCard,    title: "Real-Time Sales",         desc: "Cash, Card & EFT - instant processing" },
    { icon: Package,       title: "Inventory Management",    desc: "Live stock tracking with alerts" },
    { icon: Users,         title: "Customer Directory",      desc: "Full CRM with history & notes" },
    { icon: BarChart3,     title: "Sales Analytics",         desc: "Charts, filters & daily breakdowns" },
    { icon: FileText,      title: "Invoices & Quotes",       desc: "PDF generation with your branding" },
    { icon: Share2,        title: "WhatsApp Sharing",        desc: "Send docs directly to customers" },
    { icon: UserCheck,     title: "Staff Management",        desc: "Role-based access & permissions" },
    { icon: PieChart,      title: "Void Sales",              desc: "Tracked reversals with reason logs" },
    { icon: Wallet,        title: "Tips Support",            desc: "Tip options built into checkout" },
    { icon: FileSpreadsheet, title: "Excel Import/Export",  desc: "Bulk inventory & report exports" },
    { icon: Languages,     title: "English & Afrikaans",     desc: "Full bilingual interface support" },
    { icon: Smartphone,    title: "Any Device",              desc: "Phone, tablet, laptop or desktop" },
    { icon: Cloud,         title: "Cloud-Based",             desc: "Always online, always synced" },
    { icon: Shield,        title: "Bank-Grade Security",     desc: "Encrypted, multi-tenant isolation" },
    { icon: Calculator,    title: "Tax & Discounts",         desc: "VAT, line-item discounts, totals" },
    { icon: MessageSquare, title: "Email Documents",         desc: "Send invoices & quotes by email" },
  ];

  const testimonials = [
    { name: "Sipho Mahlangu", role: "Spaza Shop Owner, Soweto", text: "Storm POS transformed how I run my shop. I can track every sale from my phone and never lose stock again.", stars: 5 },
    { name: "Johan Botha", role: "Hardware Store, Stellenbosch", text: "The invoicing is brilliant. Clients get a professional PDF quote in seconds. Worth every cent of the 0.5%.", stars: 5 },
    { name: "Aisha Nkosi", role: "Boutique Owner, Cape Town", text: "Switching from our old system was effortless. The Afrikaans interface alone made my staff 3x more confident.", stars: 5 },
  ];

  const comparison = [
    { feature: "Monthly fee", storm: "R0", traditional: "R500+" },
    { feature: "Setup cost", storm: "R0", traditional: "R3 000+" },
    { feature: "Works on any device", storm: true, traditional: false },
    { feature: "Cloud & real-time sync", storm: true, traditional: false },
    { feature: "Built-in invoicing", storm: true, traditional: false },
    { feature: "Afrikaans support", storm: true, traditional: false },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-white">

      {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/pos">
            <img src={stormLogo} alt="Storm POS" className="h-10 w-auto block cursor-pointer -ml-1" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[hsl(217,90%,40%)] rounded-lg hover:bg-[hsl(217,90%,40%)]/6 transition-colors">
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-gray-700 hover:text-[hsl(217,90%,40%)] font-medium">
              <Link href="/pos/login">Log In</Link>
            </Button>
            <Button asChild size="sm" className="bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold px-5 rounded-full border-0">
              <Link href="/pos/signup"><Zap className="w-3.5 h-3.5 mr-1.5" />Free Trial</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[hsl(217,90%,40%)] hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── MOBILE SIDE DRAWER ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-[70] h-full w-72 bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <img src={stormLogo} alt="Storm POS" className="h-9 w-auto block -ml-1" />
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {NAV_LINKS.map(({ label, href }) => (
                  <a key={label} href={href} onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-[hsl(217,90%,40%)] rounded-xl hover:bg-[hsl(217,90%,40%)]/8 transition-colors">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="px-4 py-5 border-t border-gray-100 space-y-3">
                <Button asChild variant="outline" className="w-full border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)]/5 font-semibold rounded-full">
                  <Link href="/pos/login">Log In to POS</Link>
                </Button>
                <Button asChild className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-bold rounded-full border-0">
                  <Link href="/pos/signup"><Zap className="w-4 h-4 mr-2" />Start Free Trial</Link>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/40 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <motion.div className="absolute -top-24 -right-24 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
          animate={{ scale:[1,1.15,1] }} transition={{ duration:10, repeat:Infinity }} />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left */}
            <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8 }} className="space-y-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-4 py-1.5 rounded-full mb-4">
                  Next-Gen Cloud POS
                </span>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 mb-3">
                  The POS That Goes<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,55%)]">Everywhere You Do</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  Cloud-powered point of sale for South African retailers. Sell, invoice, manage stock and track your business from any device.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] text-white hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,57%)] font-bold px-8 py-6 text-base shadow-xl shadow-blue-500/25 hover:scale-105 transition-all border-0">
                  <Link href="/pos/signup"><Zap className="w-4 h-4 mr-2" />Start 7-Day Free Trial</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-[hsl(217,90%,40%)] text-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,40%)]/5 font-semibold px-8 py-6 text-base hover:scale-105 transition-all">
                  <Link href="/pos/login">Log In to POS</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-5 pt-2 border-t border-gray-100">
                {["No Setup Fees","7-Day Free Trial","No Credit Card","Any Device"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-gray-600 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />{t}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Monitor className="w-4 h-4 shrink-0" />
                <span>Prefer a desktop app?</span>
                <a href="https://github.com/storm-za/Storm-POS/releases/latest" target="_blank" rel="noopener noreferrer" className="font-semibold text-[hsl(217,90%,40%)] hover:underline">Download for Windows →</a>
              </div>
            </motion.div>

            {/* Right - multi-device SVG illustration */}
            <motion.div initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.8, delay:0.2 }} className="relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/15 to-[hsl(217,90%,55%)]/10 blur-3xl rounded-full scale-110" />
                <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-[hsl(217,90%,40%)]/15 shadow-2xl">
                  <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }}>
                    <MultiDeviceSync className="w-full h-auto" />
                  </motion.div>
                </div>
                <div className="absolute -top-4 -right-2 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />99.9% Uptime
                </div>
                <div className="absolute top-1/3 -left-6 bg-white text-[hsl(217,90%,40%)] px-3 py-2 rounded-xl shadow-xl border border-[hsl(217,90%,40%)]/30 text-xs font-bold flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />Cloud Synced
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section className="py-5 px-4 bg-white border-y border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16">
          {[["500+","SA Businesses"],["R0","Setup Fee"],["7-Day","Free Trial"],["4.8/5","Rating"]].map(([val,lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">{val}</div>
              <div className="text-xs text-gray-500 font-medium">{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE SHOWCASE ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Invoice & Quotes */}
          <motion.div className="grid md:grid-cols-2 gap-10 items-center"
            initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-3 py-1 rounded-full">Invoices & Quotes</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-3">Professional documents in seconds</h2>
              <p className="text-gray-500 mb-5">Create branded invoices and quotes with automatic numbering, line items, tax, and PDF export. Send via WhatsApp or email directly from the system.</p>
              <ul className="space-y-2">
                {["Automatic INV/QUO numbering","PDF export with your logo","Status workflow: Draft to Paid","WhatsApp & email sharing"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-[hsl(217,90%,40%)] shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <InvoicePreview className="w-full h-auto" />
            </div>
          </motion.div>

          {/* Reporting */}
          <motion.div className="grid md:grid-cols-2 gap-10 items-center"
            initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <ReportingDashboard className="w-full h-auto" />
            </div>
            <div className="order-1 md:order-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-3 py-1 rounded-full">Analytics & Reports</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-3">Know your numbers at a glance</h2>
              <p className="text-gray-500 mb-5">Real-time sales dashboard with charts, date filters, staff breakdowns, and Excel export. Make data-driven decisions every day.</p>
              <ul className="space-y-2">
                {["Daily, weekly & monthly sales charts","Staff performance tracking","Excel export for accountants","Best-seller product insights"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-[hsl(217,90%,40%)] shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ALL FEATURES BENTO ────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50/60">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-4 py-1.5 rounded-full">Everything You Need</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">One System. Every Feature.</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Every tool your business needs - built in, not bolted on.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[hsl(217,90%,40%)]/30 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] rounded-xl flex items-center justify-center mb-3 shadow group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-gray-900 text-sm mb-0.5">{f.title}</div>
                <div className="text-xs text-gray-500 leading-snug">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────── */}
      <section id="pricing" className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-4 py-1.5 rounded-full">Transparent Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">Pay Only When You Sell</h2>
            <p className="text-gray-500">No monthly fees. No surprises. Your profits, your pace.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* % plan */}
            <motion.div initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className="relative bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] rounded-2xl p-8 text-white shadow-2xl shadow-blue-500/25">
              <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
              <TrendingUp className="w-9 h-9 mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-1">0.5%</div>
              <div className="text-white/80 text-sm mb-5">per sale - pay less as you grow</div>
              <ul className="space-y-2.5">
                {["Best for growing businesses","Scales with your revenue","+ R0.50 per invoice/quote","7-day free trial included"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-300 shrink-0" />{t}</li>
                ))}
              </ul>
            </motion.div>

            {/* flat plan */}
            <motion.div initial={{ opacity:0, x:20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:border-[hsl(217,90%,40%)]/40 transition-all">
              <CreditCard className="w-9 h-9 text-[hsl(217,90%,40%)] mb-4" />
              <div className="text-4xl font-bold text-gray-900 mb-1">R1.00</div>
              <div className="text-gray-500 text-sm mb-5">flat per sale - predictable costs</div>
              <ul className="space-y-2.5">
                {["Best for high-value transactions","Fixed cost per sale - no surprises","+ R0.50 per invoice/quote","7-day free trial included"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" /><span className="text-gray-700">{t}</span></li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-green-800 text-sm">7-Day Free Trial - No Credit Card</div>
              <div className="text-green-700 text-xs mt-0.5">Full access to every feature. Cancel anytime. Zero risk.</div>
            </div>
            <Button asChild className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] text-white font-bold px-6 border-0 hover:scale-105 transition-all shrink-0">
              <Link href="/pos/signup">Start Free →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── VS COMPARISON ─────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50/60">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-8"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Storm vs Traditional POS</h2>
          </motion.div>

          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 border-b border-gray-200">
              <div>Feature</div>
              <div className="text-center text-[hsl(217,90%,40%)]">Storm POS</div>
              <div className="text-center text-gray-400">Traditional</div>
            </div>
            {comparison.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-5 py-3.5 text-sm ${i % 2 === 0 ? "" : "bg-gray-50/50"} border-b border-gray-100 last:border-0`}>
                <div className="text-gray-700 font-medium">{row.feature}</div>
                <div className="text-center">
                  {typeof row.storm === "boolean"
                    ? <Check className="w-4 h-4 text-green-500 mx-auto" />
                    : <span className="font-bold text-[hsl(217,90%,40%)]">{row.storm}</span>}
                </div>
                <div className="text-center">
                  {typeof row.traditional === "boolean"
                    ? <X className="w-4 h-4 text-red-400 mx-auto" />
                    : <span className="text-gray-400">{row.traditional}</span>}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <span className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-4 py-1.5 rounded-full">Trusted Across South Africa</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">What Our Customers Say</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to Run Your Business Smarter?</h2>
            <p className="text-white/80 mb-8 text-lg">7 days free. No credit card. No risk. Just results.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-50 font-bold px-10 py-6 text-base hover:scale-105 transition-all border-0 shadow-xl">
                <Link href="/pos/signup"><Zap className="w-4 h-4 mr-2" />Start Free Trial</Link>
              </Button>
              <a href="https://github.com/storm-za/Storm-POS/releases/latest" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-8 py-3 rounded-lg transition-all text-sm">
                <Monitor className="w-4 h-4" />Download for Windows
              </a>
            </div>
            <p className="mt-6 text-white/60 text-xs">After trial: 0.5% per sale or R1 flat per sale. + R0.50 per invoice. Zero monthly fees, ever.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
