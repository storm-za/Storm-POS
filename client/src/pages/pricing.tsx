import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Check, X, CaretDown as ChevronDown, CaretUp as ChevronUp,
  RocketLaunch as Zap, ShieldCheck, ChartBar,
  Globe, FileText, Users, CurrencyDollar,
  Receipt, ArrowRight, Sparkle, Question,
  Package, Buildings
} from "@phosphor-icons/react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { updatePageSEO } from "@/lib/seo";
import { useEffect } from "react";


const features = [
  { cat: "Core POS", items: [
    { name: "Sales processing", storm: true, trad: true },
    { name: "Multiple payment types (Cash, Card, EFT)", storm: true, trad: "Extra cost" },
    { name: "Real-time stock tracking", storm: true, trad: "Limited" },
    { name: "Customer directory (CRM)", storm: true, trad: "Extra cost" },
    { name: "Void / refund management", storm: true, trad: "Limited" },
    { name: "Tip options", storm: true, trad: false },
  ]},
  { cat: "Invoices & Quotes", items: [
    { name: "Professional PDF invoices", storm: "R0.50 each", trad: "Extra cost" },
    { name: "Quotes / pro-forma", storm: "R0.50 each", trad: "Extra cost" },
    { name: "Status workflow (Draft, Sent, Paid)", storm: true, trad: false },
    { name: "Client management", storm: true, trad: "Extra cost" },
    { name: "PDF branding with logo", storm: true, trad: "Extra cost" },
    { name: "Auto-numbering", storm: true, trad: false },
  ]},
  { cat: "Inventory & Products", items: [
    { name: "Unlimited products", storm: true, trad: "Limited" },
    { name: "Product categories", storm: true, trad: true },
    { name: "Barcode scanning", storm: true, trad: true },
    { name: "Excel import / export", storm: true, trad: false },
    { name: "Low-stock tracking", storm: true, trad: "Extra cost" },
  ]},
  { cat: "Analytics & Reports", items: [
    { name: "Sales analytics dashboard", storm: true, trad: "Basic" },
    { name: "Date-range filtering", storm: true, trad: "Limited" },
    { name: "Staff performance reports", storm: true, trad: false },
    { name: "Product revenue breakdown", storm: true, trad: "Extra cost" },
    { name: "Export reports to PDF / Excel", storm: true, trad: "Extra cost" },
  ]},
  { cat: "Staff & Security", items: [
    { name: "Multi-user staff accounts", storm: true, trad: "Extra cost" },
    { name: "Role-based access control", storm: true, trad: "Extra cost" },
    { name: "Secure PIN login for staff", storm: true, trad: "Limited" },
    { name: "Bank-grade data encryption", storm: true, trad: "Varies" },
  ]},
  { cat: "Platform & Support", items: [
    { name: "Works on any device / browser", storm: true, trad: false },
    { name: "Cloud sync across devices", storm: true, trad: false },
    { name: "Afrikaans language support", storm: true, trad: false },
    { name: "Windows desktop app", storm: true, trad: false },
    { name: "Android app", storm: true, trad: false },
    { name: "No setup fee", storm: true, trad: false },
    { name: "No lock-in contracts or cancellation fees", storm: true, trad: false },
    { name: "7-day free trial", storm: true, trad: false },
  ]},
];

const faqs = [
  {
    q: "When does the 7-day free trial end?",
    a: "Your trial starts the moment you sign up and lasts exactly 7 days. During this time you pay absolutely nothing — not a single cent. On day 8, your chosen plan activates and the flat monthly fee applies from that billing cycle."
  },
  {
    q: "What is the difference between Starter, Growth, and Scale?",
    a: "All three plans are flat-rate monthly fees. Starter (R299/month) is ideal for small or new businesses — it's our most affordable entry point and includes 50 invoices. Growth (R599/month) suits growing businesses with 200 invoices included and priority email support. Scale (R999/month) is built for high-volume operations with unlimited invoices, multi-location support, and priority phone & email assistance."
  },
  {
    q: "How are invoice fees charged on each plan?",
    a: "Starter includes 50 invoices per month; any extras are R0.50 each. Growth includes 200 invoices per month; extras are R0.50 each. Scale includes unlimited invoices at no extra charge."
  },
  {
    q: "Can I switch plans at any time?",
    a: "Plan switches are allowed between the 1st and 5th of each month to avoid mid-cycle billing confusion. Head to Settings → Billing inside the POS to switch."
  },
  {
    q: "What if my business is just starting out — is Starter right for me?",
    a: "Starter at R299/month is our most affordable flat-rate plan. It includes all features and 50 invoices per month — more than enough for most new businesses. If you grow beyond 50 invoices regularly, switching to Growth will give you 200 invoices at R599/month."
  },
  {
    q: "Is there a long-term contract or cancellation fee?",
    a: "No contract whatsoever. You can cancel your Storm POS account at any time with no cancellation fee. Your data remains accessible for 30 days after cancellation."
  },
  {
    q: "Do the fees include VAT?",
    a: "All fees shown are exclusive of VAT. VAT at the standard South African rate (15%) will be added to your usage invoice where applicable."
  },
  {
    q: "How will I know when I should switch plans?",
    a: "Storm POS automatically monitors your usage and will show you a banner inside the POS — and send you an email — when switching plans would save you money. You can also switch manually at any time from your billing settings."
  },
];

export default function Pricing() {
  useEffect(() => {
    updatePageSEO({
      title: "Pricing - Storm POS | Starter, Growth & Scale | 7-Day Free Trial",
      description: "Simple, transparent flat-rate pricing for South African retailers. Starter (R299/month), Growth (R599/month), Scale (R999/month). No setup fees. 7-day free trial.",
      canonical: "https://stormsoftware.co.za/pricing"
    });
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCats, setOpenCats] = useState<string[]>(features.map(f => f.cat));

  const toggleCat = (cat: string) =>
    setOpenCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50/60">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative max-w-4xl mx-auto">
          {/* Heading */}
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="block h-px w-10 bg-[hsl(217,90%,40%)]" />
              <span className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rotate-45 inline-block shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(217,90%,40%)]">Simple Pricing</span>
              <span className="w-1.5 h-1.5 bg-[hsl(217,90%,40%)] rotate-45 inline-block shrink-0" />
              <span className="block h-px w-10 bg-[hsl(217,90%,40%)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Flat-rate pricing. No surprises.
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Three straightforward flat-rate plans — no percentage cuts, no surprise charges. Pick the one that fits your business size.
            </p>
          </motion.div>

          {/* Plan summary cards */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              {
                name: "Starter",
                price: "R299",
                sub: "flat rate · no surprises",
                color: "hsl(217,90%,40%)",
                bgClass: "bg-[hsl(217,90%,40%)] text-white",
                borderClass: "border-[hsl(217,90%,40%)]",
                highlights: [
                  "Full POS terminal",
                  "Up to 200 products",
                  "50 invoices per month",
                  "Customer directory & purchase orders",
                  "VAT-ready invoices · XERO integration",
                  "7-day free trial",
                ],
              },
              {
                name: "Growth",
                price: "R599",
                sub: "flat fee · most popular",
                color: "#059669",
                bgClass: "bg-white text-gray-900",
                borderClass: "border-emerald-300",
                highlights: [
                  "Everything in Starter",
                  "Unlimited products",
                  "200 invoices included (R0.50 extra)",
                  "Staff accounts (up to 5)",
                  "Full analytics & PDF export",
                  "7-day free trial",
                ],
              },
              {
                name: "Scale",
                price: "R999",
                sub: "per month · enterprise",
                color: "#7c3aed",
                bgClass: "bg-white text-gray-900",
                borderClass: "border-purple-300",
                highlights: [
                  "Everything in Growth",
                  "Unlimited invoices",
                  "Multi-location / branch support",
                  "Unlimited staff · role-based permissions",
                  "Dedicated priority support",
                  "7-day free trial",
                ],
              },
            ].map((plan, i) => (
              <div key={plan.name}
                className={`rounded-2xl border-2 ${plan.borderClass} ${plan.bgClass} p-6 shadow-sm flex flex-col`}>
                <div className="mb-4">
                  <div className="text-sm font-bold uppercase tracking-wide opacity-70 mb-1">{plan.name}</div>
                  <div className="text-4xl font-black tracking-tight mb-0.5">{plan.price}</div>
                  <div className="text-xs opacity-60">{plan.sub}</div>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.highlights.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 shrink-0" weight="bold" style={{ color: plan.name === "Starter" ? "#86efac" : "#22c55e" }} />{f}
                    </li>
                  ))}
                </ul>
                <Button asChild className={`w-full font-bold py-2.5 rounded-xl text-sm border-0 hover:scale-105 transition-all ${plan.name === "Starter" ? "bg-white text-[hsl(217,90%,40%)] hover:bg-blue-50" : plan.name === "Growth" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                  <Link href="/pos/signup">Start Free Trial</Link>
                </Button>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center">
            <p className="text-sm text-gray-400">All prices exclude VAT (15%). 7-day free trial — no credit card required. Cancel anytime.</p>
          </motion.div>
        </div>
      </section>

      {/* ── PLAN CARDS ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Three plans. Zero surprises.</h2>
            <p className="text-gray-500 text-lg">Pick the plan that fits your business — every price is flat, every month.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="relative bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] rounded-3xl p-7 text-white shadow-2xl shadow-blue-500/25 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-semibold opacity-80 uppercase tracking-wide">Starter</span>
                </div>
                <div className="text-5xl font-black mb-1 tracking-tight">R299</div>
                <div className="text-white/75 text-sm mb-4">flat rate · no surprises</div>
                <p className="text-white/80 text-xs mb-4 leading-relaxed">Perfect for new and growing businesses. One flat monthly fee — no percentage cuts, no surprise charges.</p>

                <div className="bg-white/10 rounded-2xl p-4 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-2">What's included</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="opacity-80">Monthly base fee</span><span className="font-semibold">R299</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Invoices (first 50)</span><span className="font-semibold">Free</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Products</span><span className="font-semibold">Up to 200</span></div>
                  </div>
                </div>

                <ul className="space-y-2 mb-7">
                  {["Full POS terminal","Up to 200 products","50 invoices per month","Customer directory","Purchase orders","Open accounts / credit sales","Custom receipt & invoice branding","Basic sales reports","XERO integration","VAT-ready invoices","Email support","7-day free trial"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-green-300 shrink-0" weight="bold" />{f}</li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-blue-50 font-bold py-3 rounded-xl text-base border-0 hover:scale-105 transition-all">
                  <Link href="/pos/signup">Start Free Trial</Link>
                </Button>
              </div>
            </motion.div>

            {/* Growth plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="relative bg-white rounded-3xl p-7 border-2 border-emerald-200 shadow-lg hover:border-emerald-400/60 hover:shadow-xl transition-all overflow-hidden group">
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Popular</div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollar className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Growth</span>
                </div>
                <div className="text-5xl font-black text-gray-900 mb-1 tracking-tight">R599</div>
                <div className="text-gray-400 text-sm mb-4">flat fee · most popular</div>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">For businesses ready to scale. Predictable costs, deeper insights, and tools to grow your team.</p>

                <div className="bg-emerald-50 rounded-2xl p-4 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-2">What's included</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Monthly base fee</span><span className="font-semibold text-gray-900">R599</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Invoices (first 200)</span><span className="font-semibold text-gray-900">Free</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Extra invoices</span><span className="font-semibold text-gray-900">+R0.50 each</span></div>
                  </div>
                </div>

                <ul className="space-y-2 mb-7">
                  {["Everything in Starter","Unlimited products","200 invoices included (R0.50 each extra)","Full sales analytics & PDF export","Staff accounts (up to 5)","Top products & dead stock reports","Period-over-period comparisons","Automated invoice reminders","WhatsApp receipt sending","Priority email support","7-day free trial"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />{f}</li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-base border-0 hover:scale-105 transition-all">
                  <Link href="/pos/signup">Start Free Trial</Link>
                </Button>
              </div>
            </motion.div>

            {/* Scale plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 }}
              className="relative bg-white rounded-3xl p-7 border-2 border-purple-200 shadow-lg hover:border-purple-400/60 hover:shadow-xl transition-all overflow-hidden group">
              <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">Scale</div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Scale</span>
                </div>
                <div className="text-5xl font-black text-gray-900 mb-1 tracking-tight">R999</div>
                <div className="text-gray-400 text-sm mb-4">per month · enterprise</div>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">For established businesses running multiple locations or large teams. Full control, maximum features, priority assistance.</p>

                <div className="bg-purple-50 rounded-2xl p-4 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wide text-purple-600 mb-2">What's included</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Monthly base fee</span><span className="font-semibold text-gray-900">R999</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Invoices</span><span className="font-semibold text-gray-900">Unlimited</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Locations</span><span className="font-semibold text-gray-900">Multi-location</span></div>
                  </div>
                </div>

                <ul className="space-y-2 mb-7">
                  {["Everything in Growth","Unlimited invoices","Multi-location / branch support","Unlimited staff accounts","Role-based permissions (Cashier / Manager / Admin)","Consolidated multi-branch reporting","Customer loyalty points system","Dedicated priority support","Early access to new features","7-day free trial"].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700"><Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />{f}</li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-base border-0 hover:scale-105 transition-all">
                  <Link href="/pos/signup">Start Free Trial</Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Free trial banner */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="mt-6 bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkle className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <div className="font-semibold text-green-800 text-sm">7-Day Free Trial - No Credit Card Required</div>
                <div className="text-green-700 text-xs mt-0.5">Full access to every feature. Cancel anytime. Zero risk.</div>
              </div>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 border-0 shrink-0 rounded-full">
              <Link href="/pos/signup"><ArrowRight className="w-4 h-4 mr-1.5" />Get Started Free</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE TABLE ──────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Everything included. Always.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">All plans include every single feature. No upsells, no "pro-only" features, no per-feature pricing.</p>
          </motion.div>

          {/* Table header */}
          <div className="sticky top-16 z-10 bg-white border-b-2 border-gray-100 mb-0 rounded-t-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 px-6 py-4">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Feature</div>
              <div className="text-center">
                <span className="inline-block bg-[hsl(217,90%,40%)] text-white text-xs font-bold px-3 py-1 rounded-full">Storm POS</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">Others</span>
              </div>
            </div>
          </div>

          {/* Feature categories */}
          <div className="rounded-b-2xl border border-gray-200 border-t-0 overflow-hidden shadow-sm">
            {features.map((cat, ci) => (
              <div key={cat.cat}>
                {/* Category header */}
                <button
                  onClick={() => toggleCat(cat.cat)}
                  className="w-full flex items-center justify-between px-6 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
                >
                  <span className="text-sm font-bold text-[hsl(217,90%,40%)] uppercase tracking-wide">{cat.cat}</span>
                  {openCats.includes(cat.cat)
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {/* Rows */}
                {openCats.includes(cat.cat) && cat.items.map((row, ri) => (
                  <div key={row.name}
                    className={`grid grid-cols-3 px-6 py-3.5 text-sm border-b border-gray-100 last:border-0 ${ri % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                    <div className="text-gray-700 font-medium pr-4">{row.name}</div>
                    <div className="text-center">
                      {row.storm === true
                        ? <Check className="w-5 h-5 text-green-500 mx-auto" weight="bold" />
                        : row.storm === false
                          ? <X className="w-5 h-5 text-red-400 mx-auto" />
                          : <span className="text-[hsl(217,90%,40%)] font-semibold text-xs">{row.storm}</span>}
                    </div>
                    <div className="text-center">
                      {row.trad === true
                        ? <Check className="w-5 h-5 text-green-500 mx-auto" weight="bold" />
                        : row.trad === false
                          ? <X className="w-5 h-5 text-red-400 mx-auto" />
                          : <span className="text-gray-500 text-xs font-medium">{row.trad}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-[hsl(217,90%,40%)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { val: "R0", label: "Setup cost" },
            { val: "R0", label: "Lock-in fees" },
            { val: "500+", label: "SA businesses" },
            { val: "7 days", label: "Free trial" },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-3xl font-black mb-1">{val}</div>
              <div className="text-white/70 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Question className="w-6 h-6 text-[hsl(217,90%,40%)]" />
              <h2 className="text-3xl font-bold text-gray-900">Frequently asked</h2>
            </div>
            <p className="text-gray-500">Everything you need to know about Storm POS pricing.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4 text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-[hsl(217,90%,40%)] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)]">
        <div className="max-w-3xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkle className="w-10 h-10 mx-auto mb-5 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pick the plan that grows with your business.</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join 500+ South African retailers already running on Storm POS. 7 days free - no card, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-[hsl(217,90%,40%)] hover:bg-blue-50 font-bold px-10 py-6 text-base rounded-full border-0 hover:scale-105 transition-all shadow-xl">
                <Link href="/pos/signup"><Zap className="w-5 h-5 mr-2" />Start 7-Day Free Trial</Link>
              </Button>
              <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/15 font-semibold px-10 py-6 text-base rounded-full hover:scale-105 transition-all shadow-none">
                <Link href="/pos">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
