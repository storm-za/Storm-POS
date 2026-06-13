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
  Desktop as Monitor, Star, X, List as Menu,
  Tag, Wrench
} from "@phosphor-icons/react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1761856744843.png";
import { updatePageSEO } from "@/lib/seo";
import { SiGoogleplay } from "react-icons/si";
import MultiDeviceSync from "@/components/illustrations/MultiDeviceSync";
import InvoicePreview from "@/components/illustrations/InvoicePreview";
import ReportingDashboard from "@/components/illustrations/ReportingDashboard";

const NAV_LINKS = [
  { label: "Home",    href: "/" },
  { label: "Pricing", href: "#pricing" },
  { label: "Web Dev", href: "/web-development" },
  { label: "Contact", href: "/contact" },
  { label: "About",   href: "/#about" },
];

export default function POS() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'scale'>('growth');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    updatePageSEO({
      title: 'Storm POS - Cloud Point of Sale System | Starter R299, Growth R599, Scale R999 | 7-Day Free Trial',
      description: 'The smartest POS system for South African retailers. Flat-rate plans from R299/month — no percentage cuts, no surprises. Starter, Growth & Scale. Try free for 7 days.',
      canonical: 'https://stormsoftware.co.za/pos'
    });
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
    { name: "Johan Botha", role: "Hardware Store, Stellenbosch", text: "The invoicing is brilliant. Clients get a professional PDF quote in seconds. Completely worth it at R299 a month.", stars: 5 },
    { name: "Aisha Nkosi", role: "Boutique Owner, Cape Town", text: "Switching from our old system was effortless. The Afrikaans interface alone made my staff 3x more confident.", stars: 5 },
  ];

  const comparison = [
    { feature: "Monthly fee", storm: "R299–R999", traditional: "R500+", Icon: Tag },
    { feature: "Setup cost", storm: "R0", traditional: "R3 000+", Icon: Wrench },
    { feature: "Works on any device", storm: true, traditional: false, Icon: Monitor },
    { feature: "Cloud & real-time sync", storm: true, traditional: false, Icon: Cloud },
    { feature: "Built-in invoicing", storm: true, traditional: false, Icon: FileText },
    { feature: "Afrikaans support", storm: true, traditional: false, Icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-white">

      {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${scrolled ? "shadow-md" : "shadow-sm border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
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
              <Link href="/pos/onboarding"><Zap className="w-3.5 h-3.5 mr-1.5" />Start for Free</Link>
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
                <Link href="/"><img src={stormLogo} alt="Storm POS" className="h-9 w-auto block -ml-1 cursor-pointer" /></Link>
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
                  <Link href="/pos/onboarding"><Zap className="w-4 h-4 mr-2" />Start for Free</Link>
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
                  <Link href="/pos/onboarding"><Zap className="w-4 h-4 mr-2" />Start for Free</Link>
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

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/storm-za/Storm-POS/releases/download/v1.5.34/Storm.POS_1.5.34_x64-setup.exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm border border-gray-700 hover:scale-105"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                  <span>Download for Windows</span>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=za.storm.pos&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm border border-gray-700 hover:scale-105"
                >
                  <SiGoogleplay className="w-4 h-4 shrink-0 text-[#01875f]" />
                  <span>Get it on Google Play</span>
                </a>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-3">Choose Your Plan</h2>
            <p className="text-gray-500">Start free for 7 days. Pick the plan that fits your sales volume.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Starter plan */}
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              onClick={() => setSelectedPlan('starter')}
              className={`relative bg-white rounded-2xl p-7 border-2 shadow-lg transition-all cursor-pointer flex flex-col ${
                selectedPlan === 'starter'
                  ? 'border-[hsl(217,90%,40%)] ring-2 ring-[hsl(217,90%,40%)]/30 bg-blue-50/40'
                  : 'border-gray-200 hover:border-[hsl(217,90%,40%)]/40'
              }`}>
              {selectedPlan === 'starter' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[hsl(217,90%,40%)] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" weight="bold" />
                </div>
              )}
              <TrendingUp className="w-8 h-8 text-[hsl(217,90%,40%)] mb-4" />
              <div className="text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] mb-1">Starter</div>
              <div className="text-3xl font-bold text-gray-900 mb-3">R299<span className="text-base font-normal text-gray-400 ml-1">/month</span></div>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">Perfect for new and growing businesses. One flat monthly fee — no percentage cuts.</p>
              <ul className="space-y-2 flex-1">
                {[
                  "Full POS terminal",
                  "Up to 200 products",
                  "50 invoices per month",
                  "Customer directory",
                  "Purchase orders",
                  "Open accounts / credit sales",
                  "Custom receipt & invoice branding",
                  "Basic sales reports",
                  "XERO integration",
                  "VAT-ready invoices",
                  "Email support",
                  "7-day free trial",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-500 shrink-0" /><span className="text-gray-700">{t}</span></li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild className={`w-full font-semibold transition-all ${
                  selectedPlan === 'starter'
                    ? 'bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]'
                    : 'bg-white text-[hsl(217,90%,40%)] border border-[hsl(217,90%,40%)] hover:bg-blue-50'
                }`}>
                  <Link href="/pos/onboarding">Start for free →</Link>
                </Button>
              </div>
            </motion.div>

            {/* Growth plan */}
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: 0.05 }}
              onClick={() => setSelectedPlan('growth')}
              className={`relative rounded-2xl p-7 text-white shadow-2xl shadow-blue-500/25 transition-all cursor-pointer flex flex-col ${
                selectedPlan === 'growth'
                  ? 'bg-gradient-to-br from-[hsl(217,90%,38%)] to-[hsl(217,90%,50%)] ring-4 ring-white/40'
                  : 'bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)]'
              }`}>
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {selectedPlan === 'growth' ? (
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[hsl(217,90%,40%)]" weight="bold" />
                  </div>
                ) : (
                  <div className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
                )}
              </div>
              <CreditCard className="w-8 h-8 mb-4 opacity-90" />
              <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Growth</div>
              <div className="text-3xl font-bold mb-3">R599<span className="text-base font-normal text-white/60 ml-1">/month</span></div>
              <p className="text-white/60 text-xs mb-4 leading-relaxed">For businesses ready to scale. Deeper insights, tools to grow your team.</p>
              <ul className="space-y-2 flex-1">
                {[
                  "Everything in Starter",
                  "Unlimited products",
                  "200 invoices included (R0.50 each extra)",
                  "Full sales analytics & PDF export",
                  "Staff accounts (up to 5)",
                  "Top products & dead stock reports",
                  "Period-over-period comparisons",
                  "Automated invoice reminders",
                  "WhatsApp receipt sending",
                  "Priority email support",
                  "7-day free trial",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-300 shrink-0" />{t}</li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild className={`w-full font-semibold transition-all ${
                  selectedPlan === 'growth'
                    ? 'bg-white text-[hsl(217,90%,40%)] hover:bg-white/90'
                    : 'bg-transparent text-white border border-white/70 hover:bg-white/10'
                }`}>
                  <Link href="/pos/onboarding">Start for free →</Link>
                </Button>
              </div>
            </motion.div>

            {/* Scale plan */}
            <motion.div
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: 0.1 }}
              onClick={() => setSelectedPlan('scale')}
              className={`relative bg-white rounded-2xl p-7 border-2 shadow-lg transition-all cursor-pointer flex flex-col ${
                selectedPlan === 'scale'
                  ? 'border-purple-500 ring-2 ring-purple-400/30 bg-purple-50/40'
                  : 'border-purple-200 hover:border-purple-400/60'
              }`}>
              {selectedPlan === 'scale' && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" weight="bold" />
                </div>
              )}
              <Globe className="w-8 h-8 text-purple-600 mb-4" />
              <div className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-1">Scale</div>
              <div className="text-3xl font-bold text-gray-900 mb-3">R999<span className="text-base font-normal text-gray-400 ml-1">/month</span></div>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">For established businesses with multiple locations or large teams.</p>
              <ul className="space-y-2 flex-1">
                {[
                  "Everything in Growth",
                  "Unlimited invoices",
                  "Multi-location / branch support",
                  "Unlimited staff accounts",
                  "Role-based permissions (Cashier / Manager / Admin)",
                  "Consolidated multi-branch reporting",
                  "Customer loyalty points system",
                  "Dedicated priority support",
                  "Early access to new features",
                  "7-day free trial",
                ].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-purple-500 shrink-0" /><span className="text-gray-700">{t}</span></li>
                ))}
              </ul>
              <div className="mt-6">
                <Button asChild className={`w-full font-semibold transition-all ${
                  selectedPlan === 'scale'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-white text-purple-600 border border-purple-500 hover:bg-purple-50'
                }`}>
                  <Link href="/pos/onboarding">Start for free →</Link>
                </Button>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── VS COMPARISON ─────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">

          {/* Heading */}
          <motion.div className="text-center mb-14"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(217,90%,45%)] mb-4">Why Storm?</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-tight">
              Built for modern retail.<br className="hidden sm:block" /> Not the 90s.
            </h2>
            <p className="mt-4 text-gray-500 text-base max-w-md mx-auto leading-relaxed">See exactly what you get with Storm versus a traditional system.</p>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
            className="overflow-x-auto rounded-2xl border border-gray-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]"
          >
            <div className="min-w-[540px]">

              {/* Column headers */}
              <div className="grid grid-cols-3">
                {/* Feature col */}
                <div className="bg-gray-50 border-b border-gray-200 px-7 py-5 flex items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">Feature</span>
                </div>

                {/* Storm POS — dark authority header */}
                <div className="bg-[#0f172a] border-b border-[#0f172a] px-6 py-5 flex flex-col items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-white/70 text-[10px] font-semibold uppercase tracking-widest">
                    <Star weight="fill" className="w-2.5 h-2.5 text-amber-400" />
                    Recommended
                  </span>
                  <span className="text-white text-base font-bold tracking-tight mt-0.5">Storm POS</span>
                </div>

                {/* Traditional POS — muted header */}
                <div className="bg-gray-50 border-b border-l border-gray-200 px-6 py-5 flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-300">Traditional</span>
                  <span className="text-gray-400 text-base font-semibold tracking-tight">POS System</span>
                </div>
              </div>

              {/* Feature rows */}
              {comparison.map((row, i) => {
                const isLast = i === comparison.length - 1;
                return (
                  <motion.div
                    key={row.feature}
                    initial={{ opacity:0 }}
                    whileInView={{ opacity:1 }}
                    viewport={{ once:true }}
                    transition={{ duration:0.3, delay: i * 0.06 }}
                    className="grid grid-cols-3"
                  >
                    {/* Feature label */}
                    <div className={`flex items-center gap-3 px-7 py-4 bg-white ${!isLast ? "border-b border-gray-100" : ""}`}>
                      <row.Icon className="w-4 h-4 text-gray-400 flex-shrink-0" weight="regular" />
                      <span className="text-sm font-medium text-gray-700 leading-snug">{row.feature}</span>
                    </div>

                    {/* Storm cell — very subtle blue wash */}
                    <div className={`flex items-center justify-center px-6 py-4 bg-slate-50 border-l border-r border-[#e8edf5] ${!isLast ? "border-b border-b-[#e8edf5]" : ""}`}>
                      {typeof row.storm === "boolean" ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200">
                          <Check className="w-3.5 h-3.5 text-white" weight="bold" />
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-[hsl(217,90%,40%)] tabular-nums">{row.storm}</span>
                      )}
                    </div>

                    {/* Traditional cell */}
                    <div className={`flex items-center justify-center px-6 py-4 bg-white border-l border-gray-100 ${!isLast ? "border-b border-gray-100" : ""}`}>
                      {typeof row.traditional === "boolean" ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                          <X className="w-3.5 h-3.5 text-gray-400" weight="bold" />
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300 line-through tabular-nums">{row.traditional}</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Footer CTA row */}
              <div className="grid grid-cols-3 border-t border-gray-100">
                <div className="bg-gray-50 px-7 py-5" />
                <div className="bg-[#0f172a] px-6 py-5 flex items-center justify-center">
                  <Link href="/pos/onboarding">
                    <Button className="bg-white text-[#0f172a] hover:bg-gray-100 font-semibold text-sm px-5 h-9 rounded-lg shadow-none">
                      Start for Free
                    </Button>
                  </Link>
                </div>
                <div className="bg-gray-50 border-l border-gray-200 px-6 py-5 flex items-center justify-center">
                  <span className="text-xs text-gray-300">Stick with old tech</span>
                </div>
              </div>

            </div>
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
                <Link href="/pos/onboarding"><Zap className="w-4 h-4 mr-2" />Start Free Trial</Link>
              </Button>
              <a
                href="https://github.com/storm-za/Storm-POS/releases/download/v1.5.34/Storm.POS_1.5.34_x64-setup.exe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-7 py-3 rounded-lg transition-all text-sm hover:scale-105"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
                Download for Windows
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=za.storm.pos&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-7 py-3 rounded-lg transition-all text-sm hover:scale-105"
              >
                <SiGoogleplay className="w-4 h-4 shrink-0 text-[#01875f]" />
                Google Play
              </a>
            </div>
            <p className="mt-6 text-white/60 text-xs">After trial: Starter (R299/mo), Growth (R599/mo), or Scale (R999/mo). All flat-rate — no percentage cuts.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
