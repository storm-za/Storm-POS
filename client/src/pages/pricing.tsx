import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Check, X, CaretDown as ChevronDown, CaretUp as ChevronUp,
  RocketLaunch as Zap, ShieldCheck, Calculator, ChartBar,
  DeviceMobile, Globe, FileText, Users, CurrencyDollar,
  Receipt, ArrowRight, Sparkle, Star, Question, Percent,
  TrendUp, Package
} from "@phosphor-icons/react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { updatePageSEO } from "@/lib/seo";
import { useEffect } from "react";

const BLUE = "hsl(217,90%,40%)";


function BreakevenSVG({ breakeven }: { breakeven: number }) {
  const w = 300, h = 160, pad = 30;
  const maxSales = Math.max(breakeven * 2, 100);
  const maxAvg = 500;
  const points = Array.from({ length: 11 }, (_, i) => {
    const sales = (maxSales / 10) * i;
    return { sales, pct: sales * maxAvg * 0.005, flat: sales * 1.0 };
  });
  const scaleX = (sales: number) => pad + ((sales / maxSales) * (w - pad * 2));
  const scaleY = (cost: number) => {
    const maxCost = Math.max(...points.map(p => Math.max(p.pct, p.flat)));
    return h - pad - ((cost / maxCost) * (h - pad * 2));
  };
  const pctPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.sales)} ${scaleY(p.pct)}`).join(" ");
  const flatPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.sales)} ${scaleY(p.flat)}`).join(" ");
  const bx = scaleX(breakeven);
  const by = scaleY(breakeven * 1.0);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <text x="15" y="10" fill="#9ca3af" fontSize="8" fontFamily="system-ui">Cost</text>
      <text x={w - 45} y={h - 4} fill="#9ca3af" fontSize="8" fontFamily="system-ui">Sales/mo</text>
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e5e7eb" strokeWidth="1"/>
      <line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="#e5e7eb" strokeWidth="1"/>
      <path d={pctPath} stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d={flatPath} stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 2"/>
      <circle cx={bx} cy={by} r="5" fill="#f59e0b" stroke="white" strokeWidth="1.5"/>
      <rect x={bx - 28} y={by - 22} width="56" height="16" rx="4" fill="#fef3c7"/>
      <text x={bx} y={by - 10} textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="system-ui" fontWeight="700">Break-even</text>
      <text x={w - pad - 2} y={points[points.length-1] ? scaleY(points[points.length-1].pct) + 4 : 50} fill={BLUE} fontSize="8" fontFamily="system-ui">0.5%</text>
      <text x={w - pad - 2} y={points[points.length-1] ? scaleY(points[points.length-1].flat) + 4 : 80} fill="#10b981" fontSize="8" fontFamily="system-ui">Flat</text>
    </svg>
  );
}

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
    { name: "No monthly subscription fee", storm: true, trad: false },
    { name: "7-day free trial", storm: true, trad: false },
  ]},
];

const faqs = [
  {
    q: "When does the 7-day free trial end?",
    a: "Your trial starts the moment you sign up and lasts exactly 7 days. During this time you pay absolutely nothing - not a single cent. On day 8, your chosen plan activates and fees only apply to new sales from that point forward."
  },
  {
    q: "What is the difference between the 0.5% plan and the R1.00 flat plan?",
    a: "On the 0.5% plan you pay half a percent of each sale's total. On the R1.00 flat plan you pay exactly R1.00 per sale regardless of the amount. For small average transaction values (under R200), 0.5% works out cheaper. For higher-value transactions, the flat plan often wins. Use our calculator above to find your optimal plan."
  },
  {
    q: "How are invoice and quote fees charged?",
    a: "Both plans include an additional R0.50 fee per invoice or quote generated. This is separate from your per-sale fee and applies equally on both plans. If you generate 20 invoices in a month, that is R10.00 in invoice fees regardless of your plan."
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can switch between plans at any time from your account settings in the POS. The new plan applies immediately to all future sales from that point forward."
  },
  {
    q: "What happens in a month where I make zero sales?",
    a: "You pay nothing. There are no monthly subscription fees, no minimum commitments, and no hidden charges. If you make no sales, your cost is R0.00."
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
    a: "Storm POS automatically monitors your usage and will show you a banner inside the POS - and send you an email - when switching plans would save you money. You can also switch manually at any time from your account settings."
  },
];

export default function Pricing() {
  useEffect(() => {
    updatePageSEO({
      title: "Pricing - Storm POS | No Monthly Fees, Pay Only Per Sale",
      description: "Simple, transparent pricing for South African retailers. 0.5% per sale or R1.00 flat. No setup fees, no monthly subscription. 7-day free trial.",
      canonical: "https://stormsoftware.co.za/pricing"
    });
  }, []);

  const [salesCount, setSalesCount] = useState(150);
  const [avgSale, setAvgSale] = useState(350);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openCats, setOpenCats] = useState<string[]>(features.map(f => f.cat));

  const toggleCat = (cat: string) =>
    setOpenCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const { pctCost, flatCost, pctSaves, flatSaves, breakeven } = useMemo(() => {
    const pct = salesCount * avgSale * 0.005;
    const flat = salesCount * 1.0;
    return {
      pctCost: pct,
      flatCost: flat,
      pctSaves: flat > pct ? flat - pct : 0,
      flatSaves: pct > flat ? pct - flat : 0,
      breakeven: Math.ceil(1 / (avgSale * 0.005)),
    };
  }, [salesCount, avgSale]);

  const cheaper = pctCost <= flatCost ? "pct" : "flat";

  const fmt = (n: number) => `R${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ── HERO + CALCULATOR ──────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-50/60">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:56px_56px]" />

        <div className="relative max-w-5xl mx-auto">
          {/* Heading */}
          <motion.div className="text-center mb-10"
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-5 py-1.5 rounded-full mb-5">
              Pricing Calculator
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Find your perfect plan
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Adjust the sliders to match your business and see exactly what you would pay each month on each plan.
            </p>
          </motion.div>

          {/* Calculator card */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Sliders side */}
              <div className="p-8 lg:border-r border-gray-100">
                <div className="flex items-center gap-2 mb-7">
                  <Calculator className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  <h3 className="font-bold text-gray-900 text-lg">Your business</h3>
                </div>

                <div className="mb-7">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-semibold text-gray-700">Monthly sales</label>
                    <span className="text-2xl font-black text-[hsl(217,90%,40%)]">{salesCount} <span className="text-sm font-medium text-gray-400">sales</span></span>
                  </div>
                  <input type="range" min={1} max={1000} value={salesCount}
                    onChange={e => setSalesCount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[hsl(217,90%,40%)]" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>1</span><span>500</span><span>1,000</span></div>
                </div>

                <div className="mb-7">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-semibold text-gray-700">Average sale value</label>
                    <span className="text-2xl font-black text-[hsl(217,90%,40%)]">R{avgSale} <span className="text-sm font-medium text-gray-400">avg</span></span>
                  </div>
                  <input type="range" min={10} max={5000} step={10} value={avgSale}
                    onChange={e => setAvgSale(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[hsl(217,90%,40%)]" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1.5"><span>R10</span><span>R2,500</span><span>R5,000</span></div>
                </div>

                <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center mb-6">
                  <span className="text-sm text-gray-500">Estimated monthly turnover</span>
                  <span className="font-bold text-gray-900">{fmt(salesCount * avgSale)}</span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cost curve</div>
                  <BreakevenSVG breakeven={breakeven} />
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-[hsl(217,90%,40%)] inline-block rounded" />0.5% plan</span>
                    <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-green-500 inline-block rounded" />Flat R1 plan</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />Break-even</span>
                  </div>
                </div>
              </div>

              {/* Results side */}
              <div className="p-8 bg-gradient-to-br from-gray-50/60 to-white">
                <div className="flex items-center gap-2 mb-7">
                  <ChartBar className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  <h3 className="font-bold text-gray-900 text-lg">Your monthly cost</h3>
                </div>

                <div className={`rounded-2xl p-5 mb-4 border-2 transition-all ${cheaper === "pct" ? "border-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/5" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-0.5">0.5% per-sale plan</div>
                      <div className="text-4xl font-black text-gray-900">{fmt(pctCost)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">sales fees only, excl. invoices</div>
                    </div>
                    {cheaper === "pct" && <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Best for you</div>}
                  </div>
                  {pctSaves > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      <TrendUp className="w-4 h-4 shrink-0" />
                      <span>You save <strong>{fmt(pctSaves)}/month</strong> vs the flat plan</span>
                    </div>
                  )}
                </div>

                <div className={`rounded-2xl p-5 mb-6 border-2 transition-all ${cheaper === "flat" ? "border-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/5" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-0.5">R1.00 flat plan</div>
                      <div className="text-4xl font-black text-gray-900">{fmt(flatCost)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">sales fees only, excl. invoices</div>
                    </div>
                    {cheaper === "flat" && <div className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">Best for you</div>}
                  </div>
                  {flatSaves > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      <TrendUp className="w-4 h-4 shrink-0" />
                      <span>You save <strong>{fmt(flatSaves)}/month</strong> vs the % plan</span>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-1">Break-even point</div>
                  <div className="text-sm text-amber-800">
                    At <strong>R{avgSale} average</strong> sale value, the plans are equal at <strong>{breakeven} sales/month</strong>.
                    {salesCount < breakeven ? " Below this volume, the 0.5% plan is cheaper." : " Above this volume, the flat R1.00 plan wins."}
                  </div>
                </div>

                <Button asChild className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-bold py-3.5 rounded-xl text-base border-0 hover:scale-105 transition-all">
                  <Link href="/pos/signup"><Zap className="w-4 h-4 mr-2" />Start Free - Choose Plan Later</Link>
                </Button>
                <p className="text-center text-xs text-gray-400 mt-2">Pick your plan after the 7-day trial. No card needed.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── PLAN CARDS ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Two plans. Zero surprises.</h2>
            <p className="text-gray-500 text-lg">Both include every feature. Pick how you prefer to pay.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 0.5% plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
              className="relative bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/25 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Popular</div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-semibold opacity-80 uppercase tracking-wide">Per-percentage plan</span>
                </div>
                <div className="text-6xl font-black mb-1 tracking-tight">0.5%</div>
                <div className="text-white/75 text-sm mb-7">of each sale - best for growing businesses</div>

                <div className="bg-white/10 rounded-2xl p-4 mb-6">
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-2">Example</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="opacity-80">50 sales x R200 avg</span><span className="font-semibold">R5.00/mo</span></div>
                    <div className="flex justify-between"><span className="opacity-80">200 sales x R500 avg</span><span className="font-semibold">R500/mo</span></div>
                    <div className="flex justify-between"><span className="opacity-80">Invoice (each)</span><span className="font-semibold">+R0.50</span></div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "All features included",
                    "7-day free trial",
                    "No setup fee",
                    "Pay less on small sales",
                    "Switch plans anytime",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-300 shrink-0" weight="bold" />{f}
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-blue-50 font-bold py-3 rounded-xl text-base border-0 hover:scale-105 transition-all">
                  <Link href="/pos/signup">Start Free Trial</Link>
                </Button>
              </div>
            </motion.div>

            {/* R1 flat plan */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="relative bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg hover:border-[hsl(217,90%,40%)]/50 hover:shadow-xl transition-all overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(217,90%,40%)]/3 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:bg-[hsl(217,90%,40%)]/8 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Flat-rate plan</span>
                </div>
                <div className="text-6xl font-black text-gray-900 mb-1 tracking-tight">R1.00</div>
                <div className="text-gray-400 text-sm mb-7">flat per sale - predictable costs</div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Example</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">50 sales x R200 avg</span><span className="font-semibold text-gray-900">R50.00/mo</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">200 sales x R500 avg</span><span className="font-semibold text-gray-900">R200/mo</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Invoice (each)</span><span className="font-semibold text-gray-900">+R0.50</span></div>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {[
                    "All features included",
                    "7-day free trial",
                    "No setup fee",
                    "Best for high-value sales",
                    "Switch plans anytime",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />{f}
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-bold py-3 rounded-xl text-base border-0 hover:scale-105 transition-all">
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
            <p className="text-gray-500 max-w-xl mx-auto">Both plans include every single feature. No upsells, no "pro-only" features, no per-feature pricing.</p>
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
            { val: "R0", label: "Monthly fee" },
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to stop paying monthly fees?</h2>
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
