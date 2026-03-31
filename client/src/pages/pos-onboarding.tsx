import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, ArrowRight, ArrowLeft, Sparkles, Shield, ChevronRight } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

// ─── Brand colour constant ────────────────────────────────────────────────────
const B = "hsl(217,90%,40%)";

// ─── Translations ─────────────────────────────────────────────────────────────
const LABELS = {
  en: {
    step: (n: number) => `Step ${n} of 4`,
    skip: "Skip for now",
    next: "Next",
    back: "Back",
    recommended: "Recommended",
    // Step 1
    s1Title: "What kind of operation are we setting up today?",
    s1Sub: "We'll personalise your Storm POS experience based on your business type.",
    bizTypes: [
      { id: "retail",     label: "Retail / Boutique",       sub: "Shop, clothing, hardware, gifts" },
      { id: "restaurant", label: "Restaurant / Bar",         sub: "Food service, hospitality, coffee" },
      { id: "service",    label: "Service / Freelancer",     sub: "Salon, repairs, consulting" },
      { id: "wholesale",  label: "High-Volume Wholesale",    sub: "Bulk supply, distribution" },
    ],
    // Step 2
    s2Title: "Let's recommend the perfect plan for your business.",
    s2Sub: "Your monthly sales volume helps us make sure you're not over- or under-paying.",
    volumes: [
      { id: "micro",  label: "Micro Business",      sub: "< R10,000 / month" },
      { id: "growth", label: "Growing Business",    sub: "R10,000 – R100,000 / month" },
      { id: "high",   label: "High-Volume",         sub: "R100,000+ / month or 10+ daily sales" },
    ],
    // Step 3
    s3MicroTitle:  "The perfect starting plan for you",
    s3MicroBody:   "Your volume fits our pay-as-you-grow plan perfectly. Only pay when you sell — no monthly minimums!",
    s3GrowthTitle: "Two great options — we suggest starting here",
    s3GrowthBody:  "Your volume is in the sweet spot. Start pay-as-you-grow, then switch to flat when you're ready to save even more.",
    s3HighTitle:   "You're a Power User — get the most for your money",
    s3HighBody:    "No success tax. Unlimited transactions for one fixed cost per sale. Maximise your profit as you scale.",
    pctLabel: "Pay-As-You-Grow",
    pctRate:  "0.5% per sale",
    pctPitch: "Only pay when you sell",
    flatLabel: "Flat Rate",
    flatRate:  "R1.00 per sale",
    flatPitch: "Fixed fee, unlimited sales",
    invoiceFee: "+ R0.50 per invoice / quote",
    trialNote:  "7-day free trial on both plans — no credit card needed",
    confirmPlan: "Confirm This Plan",
    saving: "Saving...",
    // Step 4
    s4Title: "Complete these 4 steps to process your first sale!",
    s4Sub:   "Tick each step as you go — we'll celebrate when you're done.",
    checklist: [
      { id: "logo",    label: "Upload Your Logo",          sub: "Personalise receipts and invoices" },
      { id: "product", label: "Add Your First Product",    sub: "Set up your inventory" },
      { id: "sale",    label: "Create a Test Sale",        sub: "See Storm POS in action" },
      { id: "payment", label: "Connect Payment Methods",   sub: "Cash, card and EFT ready" },
    ],
    doneTitle: "Congratulations!",
    doneBody:  "Your first 5 invoices are completely fee-free. Enjoy the headstart!",
    goToPOS:   "Go to My POS",
  },
  af: {
    step: (n: number) => `Stap ${n} van 4`,
    skip: "Slaan oor vir nou",
    next: "Volgende",
    back: "Terug",
    recommended: "Aanbeveel",
    s1Title: "Watter soort besigheid stel ons vandag op?",
    s1Sub: "Ons sal jou Storm POS-ondervinding aanpas op grond van jou besigheidstipe.",
    bizTypes: [
      { id: "retail",     label: "Kleinhandel / Boetiek",    sub: "Winkel, klere, hardeware, geskenke" },
      { id: "restaurant", label: "Restaurant / Kroeg",        sub: "Kosserwering, gasvryheid, koffie" },
      { id: "service",    label: "Diens / Vryskut",           sub: "Salon, herstelwerk, konsultasie" },
      { id: "wholesale",  label: "Grootmaat Groothandel",     sub: "Grootmaat lewering, distribusie" },
    ],
    s2Title: "Kom ons beveel die perfekte plan vir jou besigheid aan.",
    s2Sub: "Jou maandelikse verkoopsvolume help ons seker maak dat jy reg betaal.",
    volumes: [
      { id: "micro",  label: "Mikro-Besigheid",     sub: "< R10,000 / maand" },
      { id: "growth", label: "Groeiende Besigheid", sub: "R10,000 – R100,000 / maand" },
      { id: "high",   label: "Hoe Volume",          sub: "R100,000+ / maand of 10+ daaglikse verkope" },
    ],
    s3MicroTitle:  "Die perfekte beginplan vir jou",
    s3MicroBody:   "Jou volume pas perfek by ons betaal-soos-jy-groei-plan. Betaal slegs wanneer jy verkoop!",
    s3GrowthTitle: "Twee goeie opsies - ons stel hierdie een voor",
    s3GrowthBody:  "Jou volume is in die ideale reeks. Begin met betaal-soos-jy-groei, dan skakel oor na die vaste plan wanneer jy gereed is.",
    s3HighTitle:   "Jy is 'n Kraggebruiker - kry die meeste vir jou geld",
    s3HighBody:    "Geen sukses-belasting nie. Onbeperkte transaksies teen een vaste koste per verkoop.",
    pctLabel: "Betaal-Soos-Jy-Groei",
    pctRate:  "0.5% per verkoop",
    pctPitch: "Betaal slegs wanneer jy verkoop",
    flatLabel: "Vaste Tarief",
    flatRate:  "R1.00 per verkoop",
    flatPitch: "Vaste fooi, onbeperkte verkope",
    invoiceFee: "+ R0.50 per faktuur / kwotasie",
    trialNote:  "7-dag gratis proeftydperk op beide planne - geen kredietkaart nodig nie",
    confirmPlan: "Bevestig Hierdie Plan",
    saving: "Stoor...",
    s4Title: "Voltooi hierdie 4 stappe om jou eerste verkoop te verwerk!",
    s4Sub:   "Merk elke stap soos jy gaan - ons vier wanneer jy klaar is.",
    checklist: [
      { id: "logo",    label: "Laai Jou Logo Op",           sub: "Personaliseer kwitansies en fakture" },
      { id: "product", label: "Voeg Jou Eerste Produk By",  sub: "Stel jou inventaris op" },
      { id: "sale",    label: "Skep 'n Toetsverkoop",       sub: "Sien Storm POS in aksie" },
      { id: "payment", label: "Koppel Betaalmetodes",        sub: "Kontant, kaart en EFT gereed" },
    ],
    doneTitle: "Geluk!",
    doneBody:  "Jou eerste 5 fakture is heeltemal fooi-vry. Geniet die voorsprong!",
    goToPOS:   "Gaan na My POS",
  },
} as const;

// ─── SVG Icons — monoline black outlines, white fills, brand-blue spot ────────
const SL = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function RetailIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      <rect x="10" y="22" width="36" height="26" rx="4" fill="white" stroke="black" strokeWidth="2.5" {...SL}/>
      <path d="M20 22V18a8 8 0 0 1 16 0v4" stroke="black" strokeWidth="2.5" {...SL}/>
      {/* Price tag - brand blue spot */}
      <rect x="19" y="30" width="18" height="11" rx="2" fill={B} stroke="black" strokeWidth="1.5"/>
      <rect x="22" y="33" width="12" height="2" rx="1" fill="white" opacity="0.8"/>
      <rect x="22" y="36" width="8" height="2" rx="1" fill="white" opacity="0.6"/>
      <line x1="28" y1="30" x2="28" y2="27" stroke="black" strokeWidth="1.5"/>
      <circle cx="28" cy="25.5" r="1.8" fill="black"/>
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Fork */}
      <line x1="14" y1="12" x2="14" y2="44" stroke="black" strokeWidth="2.5" {...SL}/>
      <path d="M11 12 L11 22 Q14 25 17 22 L17 12" fill="white" stroke="black" strokeWidth="2" {...SL}/>
      {/* Knife */}
      <line x1="20" y1="12" x2="20" y2="44" stroke="black" strokeWidth="2.5" {...SL}/>
      <path d="M20 12 Q24 12 24 20 L20 22Z" fill="white" stroke="black" strokeWidth="1.5" {...SL}/>
      {/* Wine glass - brand blue fill for wine */}
      <path d="M34 10 L40 10 L44 26 L38 28 L38 38 L42 40 L42 42 L32 42 L32 40 L36 38 L36 28 L30 26Z" fill="white" stroke="black" strokeWidth="2" {...SL}/>
      <ellipse cx="37" cy="20" rx="5" ry="7" fill={B} opacity="0.85"/>
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Laptop body */}
      <rect x="6" y="22" width="34" height="20" rx="3" fill="white" stroke="black" strokeWidth="2.5" {...SL}/>
      <rect x="9" y="25" width="28" height="14" rx="1" fill="black" opacity="0.07"/>
      <path d="M2 42 L54 42 L50 46 L6 46Z" fill="white" stroke="black" strokeWidth="2" {...SL}/>
      {/* Calendar overlay */}
      <rect x="30" y="10" width="20" height="18" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <line x1="30" y1="16" x2="50" y2="16" stroke="black" strokeWidth="1.5"/>
      <line x1="35" y1="8" x2="35" y2="14" stroke="black" strokeWidth="2" {...SL}/>
      <line x1="45" y1="8" x2="45" y2="14" stroke="black" strokeWidth="2" {...SL}/>
      {/* Blue checkmark spot */}
      <circle cx="40" cy="24" r="6" fill={B}/>
      <path d="M37 24 L39.5 26.5 L44 21" stroke="white" strokeWidth="2.5" {...SL}/>
    </svg>
  );
}

function WholesaleIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Bottom crate */}
      <rect x="6" y="36" width="26" height="12" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <line x1="19" y1="36" x2="19" y2="48" stroke="black" strokeWidth="1.5"/>
      <line x1="6" y1="42" x2="32" y2="42" stroke="black" strokeWidth="1.5"/>
      {/* Top crate */}
      <rect x="8" y="24" width="22" height="12" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <line x1="19" y1="24" x2="19" y2="36" stroke="black" strokeWidth="1.5"/>
      <line x1="8" y1="30" x2="30" y2="30" stroke="black" strokeWidth="1.5"/>
      {/* Forklift */}
      <path d="M38 48 L38 28 L50 28" stroke="black" strokeWidth="2.5" {...SL}/>
      <circle cx="40" cy="48" r="3.5" fill="white" stroke="black" strokeWidth="2"/>
      <circle cx="50" cy="48" r="3.5" fill="white" stroke="black" strokeWidth="2"/>
      {/* Brand blue prongs */}
      <rect x="34" y="36" width="14" height="4" rx="1" fill={B} stroke="black" strokeWidth="1.5"/>
    </svg>
  );
}

function MicroIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Pouch */}
      <path d="M18 44 Q8 42 8 30 Q8 16 20 14 L36 14 Q48 18 48 30 Q48 42 38 44Z" fill="white" stroke="black" strokeWidth="2.5" {...SL}/>
      <path d="M18 14 Q20 8 28 8 Q36 8 38 14" fill="none" stroke="black" strokeWidth="2" {...SL}/>
      {/* Coin spots */}
      <circle cx="24" cy="32" r="6" fill={B} stroke="black" strokeWidth="1.5"/>
      <circle cx="35" cy="28" r="5" fill={B} stroke="black" strokeWidth="1.5" opacity="0.6"/>
      {/* R on coin */}
      <path d="M22 29 L22 35 M22 29 L26 29 Q27 29 27 31 Q27 33 22 33 M24 33 L27 35" stroke="white" strokeWidth="1.5" {...SL}/>
    </svg>
  );
}

function GrowthIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Note stack */}
      <rect x="6" y="38" width="30" height="12" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <rect x="8" y="32" width="30" height="12" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      {/* Top note - brand blue */}
      <rect x="10" y="26" width="30" height="12" rx="2" fill={B} stroke="black" strokeWidth="2"/>
      <line x1="14" y1="31" x2="36" y2="31" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      <line x1="14" y1="34" x2="28" y2="34" stroke="white" strokeWidth="1.5" opacity="0.5"/>
      {/* Arrow up - brand blue */}
      <line x1="46" y1="38" x2="46" y2="12" stroke={B} strokeWidth="3" {...SL}/>
      <path d="M40 18 L46 12 L52 18" stroke={B} strokeWidth="3" {...SL} fill="none"/>
    </svg>
  );
}

function HighVolumeIcon() {
  return (
    <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
      {/* Register body */}
      <rect x="6" y="26" width="44" height="22" rx="3" fill="white" stroke="black" strokeWidth="2.5"/>
      {/* Display - brand blue */}
      <rect x="6" y="12" width="44" height="16" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <rect x="9" y="15" width="38" height="10" rx="1" fill={B}/>
      <line x1="13" y1="19" x2="43" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
      <line x1="13" y1="22" x2="35" y2="22" stroke="white" strokeWidth="1" opacity="0.4"/>
      {/* Keys */}
      {([14, 22, 30, 38] as number[]).map((x: number) => (
        <rect key={x} x={x} y={34} width="6" height="5" rx="1" fill={B} stroke="black" strokeWidth="1" opacity="0.5"/>
      ))}
      {/* Drawer */}
      <rect x="10" y="42" width="36" height="4" rx="1" fill="black" opacity="0.1" stroke="black" strokeWidth="1"/>
    </svg>
  );
}

function LogoCheckIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect x="4" y="6" width="32" height="28" rx="3" fill="white" stroke="black" strokeWidth="2"/>
      <rect x="8" y="10" width="24" height="20" rx="1" stroke="black" strokeWidth="1.5" fill="none"/>
      <circle cx="14" cy="16" r="3" fill={B} opacity="0.5"/>
      <path d="M8 28 L14 22 L20 26 L26 19 L32 24" stroke={B} strokeWidth="2" {...SL} fill="none"/>
    </svg>
  );
}

function ProductCheckIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M10 16 L12 10 L22 10 L24 16" fill="none" stroke="black" strokeWidth="1.5" {...SL}/>
      <rect x="6" y="16" width="24" height="18" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <line x1="18" y1="16" x2="18" y2="34" stroke="black" strokeWidth="1"/>
      <line x1="6" y1="26" x2="30" y2="26" stroke="black" strokeWidth="1"/>
      {/* Plus icon - brand blue */}
      <circle cx="32" cy="12" r="8" fill={B}/>
      <line x1="32" y1="8" x2="32" y2="16" stroke="white" strokeWidth="2.5" {...SL}/>
      <line x1="28" y1="12" x2="36" y2="12" stroke="white" strokeWidth="2.5" {...SL}/>
    </svg>
  );
}

function SaleCheckIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <rect x="4" y="4" width="24" height="32" rx="3" fill="white" stroke="black" strokeWidth="2"/>
      <rect x="8" y="8" width="16" height="10" rx="1" fill="black" opacity="0.06" stroke="black" strokeWidth="1"/>
      <line x1="10" y1="12" x2="22" y2="12" stroke="black" strokeWidth="1" opacity="0.4"/>
      <line x1="10" y1="15" x2="18" y2="15" stroke="black" strokeWidth="1" opacity="0.3"/>
      {/* Confirm button on phone */}
      <rect x="8" y="22" width="16" height="6" rx="1" fill={B}/>
      <line x1="12" y1="25" x2="20" y2="25" stroke="white" strokeWidth="1.5" opacity="0.8"/>
      {/* Check circle */}
      <circle cx="33" cy="30" r="8" fill={B}/>
      <path d="M29.5 30 L32 32.5 L36.5 27" stroke="white" strokeWidth="2" {...SL}/>
    </svg>
  );
}

function PaymentCheckIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      {/* Card */}
      <rect x="2" y="6" width="24" height="16" rx="2" fill="white" stroke="black" strokeWidth="2"/>
      <line x1="2" y1="12" x2="26" y2="12" stroke="black" strokeWidth="2"/>
      <rect x="5" y="15" width="8" height="4" rx="1" fill={B} opacity="0.5"/>
      {/* Cash note */}
      <rect x="12" y="26" width="26" height="10" rx="2" fill={B} stroke="black" strokeWidth="1.5"/>
      <rect x="16" y="29" width="14" height="4" rx="1" fill="white" opacity="0.2"/>
      {/* Checkmark circle overlay */}
      <circle cx="34" cy="10" r="7" fill={B} stroke="white" strokeWidth="2"/>
      <path d="M31 10 L33.5 12.5 L38 8" stroke="white" strokeWidth="2" {...SL}/>
    </svg>
  );
}

function SafeNetIcon() {
  return (
    <svg viewBox="0 0 72 52" fill="none" className="w-full h-full">
      {/* Net strings horizontal */}
      {([18, 28, 38] as number[]).map((y: number) => (
        <line key={y} x1="8" y1={y} x2="64" y2={y} stroke={B} strokeWidth="2" opacity="0.7"/>
      ))}
      {/* Net strings vertical */}
      {([14, 28, 42, 56] as number[]).map((x: number) => (
        <line key={x} x1={x} y1="14" x2={x} y2="44" stroke={B} strokeWidth="2" opacity="0.7"/>
      ))}
      {/* Net border */}
      <rect x="8" y="14" width="56" height="30" rx="2" fill="none" stroke="black" strokeWidth="2.5" {...SL}/>
      {/* Person */}
      <circle cx="36" cy="8" r="5" fill="white" stroke="black" strokeWidth="2"/>
      <path d="M36 13 L36 26" stroke="black" strokeWidth="2" {...SL}/>
      <path d="M30 16 L24 12" stroke="black" strokeWidth="2" {...SL}/>
      <path d="M42 16 L48 12" stroke="black" strokeWidth="2" {...SL}/>
      <path d="M31 26 L36 32 L41 26" fill="none" stroke="black" strokeWidth="2" {...SL}/>
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 72 52" fill="none" className="w-full h-full">
      {/* Rocket body */}
      <path d="M36 6 Q48 6 52 26 L52 40 Q44 46 36 46 Q28 46 20 40 L20 26 Q24 6 36 6Z" fill="white" stroke="black" strokeWidth="2.5" {...SL}/>
      {/* Porthole - brand blue */}
      <circle cx="36" cy="22" r="7" fill={B} stroke="black" strokeWidth="2"/>
      <circle cx="36" cy="22" r="4" fill="white" opacity="0.25"/>
      {/* Fins */}
      <path d="M20 32 L10 44 L20 42Z" fill="white" stroke="black" strokeWidth="2" {...SL}/>
      <path d="M52 32 L62 44 L52 42Z" fill="white" stroke="black" strokeWidth="2" {...SL}/>
      {/* Flame trail - brand blue */}
      <path d="M30 46 Q33 56 36 50 Q39 56 42 46" stroke={B} strokeWidth="3" fill="none" {...SL}/>
      <path d="M33 48 Q35 54 36 51 Q37 54 39 48" stroke={B} strokeWidth="2" fill="none" {...SL} opacity="0.6"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Step = 0 | 1 | 2 | 3;
type BizType = "retail" | "restaurant" | "service" | "wholesale";
type Volume  = "micro" | "growth" | "high";
type Plan    = "percent" | "flat";

export default function PosOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ── Resolve user from localStorage ──
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("posUser") ?? "null"); } catch { return null; }
  })();
  const lang: "en" | "af" = user?.preferredLanguage === "af" ? "af" : "en";
  const L = LABELS[lang];

  // ── State ──
  const [step,     setStep]     = useState<Step>(0);
  const [bizType,  setBizType]  = useState<BizType | null>(null);
  const [volume,   setVolume]   = useState<Volume | null>(null);
  const [checked,  setChecked]  = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(`storm-checklist-${user?.id}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const allDone = checked.size === 4;

  // ── Redirect guards ──
  useEffect(() => {
    updatePageSEO({
      title: lang === "af" ? "Welkom by Storm POS - Aanboord" : "Welcome to Storm POS - Onboarding",
      description: "Set up your Storm POS account in a few easy steps.",
      canonical: window.location.origin + "/pos/onboarding",
    });
    if (!user) { setLocation("/pos/login"); return; }
    if (user.paymentOptionSelected) {
      setLocation(user.paid
        ? (user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system")
        : "/pos/inactive");
    }
  }, []);

  // ── Derived recommended plan ──
  const recommendedPlan: Plan = volume === "high" ? "flat" : "percent";
  const secondaryPlan:   Plan = recommendedPlan === "flat" ? "percent" : "flat";

  // ── Persist checklist ──
  const toggleCheck = useCallback((id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(`storm-checklist-${user?.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, [user?.id]);

  // ── Plan confirmation mutation ──
  const confirmMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const res = await apiRequest("PUT", `/api/pos/user/${user.id}/payment-plan`, { plan, userEmail: user.email });
      return res.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("posUser", JSON.stringify(data.user));
      setStep(3);
    },
    onError: (err: Error) => {
      if (err.message.includes("already been selected")) {
        const u = { ...user, paymentOptionSelected: true };
        localStorage.setItem("posUser", JSON.stringify(u));
        setStep(3);
        return;
      }
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // ── Skip handler ──
  const handleSkip = async () => {
    if (!user.paymentOptionSelected) {
      try {
        const res = await apiRequest("PUT", `/api/pos/user/${user.id}/payment-plan`, { plan: "percent", userEmail: user.email });
        const data = await res.json();
        localStorage.setItem("posUser", JSON.stringify(data.user));
      } catch {}
    }
    setLocation(user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
  };

  const goPOS = () => setLocation(user?.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");

  if (!user) return null;

  // ── Shared layout wrapper ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[hsl(217,30%,8%)] via-[hsl(217,25%,12%)] to-[hsl(217,20%,10%)] flex flex-col items-center justify-start px-4 pt-8 pb-12 relative overflow-x-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(217,90%,40%)]/8 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-[hsl(217,90%,50%)]/8 rounded-full blur-3xl"/>
      </div>

      {/* Top bar: logo + step indicator */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between mb-8">
        <div className="bg-white rounded-xl p-2 shadow-md">
          <img src="/storm-logo.png" alt="Storm POS" className="h-8 w-auto block"/>
        </div>
        {step < 3 && (
          <div className="flex items-center gap-2">
            {/* Step dots */}
            {([0, 1, 2, 3] as Step[]).map(s => (
              <div
                key={s}
                className={`transition-all rounded-full ${
                  s === step ? "w-6 h-2.5 bg-[hsl(217,90%,50%)]"
                  : s < step  ? "w-2.5 h-2.5 bg-[hsl(217,90%,50%)]/60"
                  : "w-2.5 h-2.5 bg-white/15"
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-gray-400">{L.step(step + 1)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {step < 3 && (
        <div className="relative z-10 w-full max-w-2xl h-0.5 bg-white/10 rounded-full mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,60%)] rounded-full"
            initial={false}
            animate={{ width: `${((step + 1) / 4) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl"
        >
          {step === 0 && <Step1 L={L} selected={bizType} onSelect={setBizType} onNext={() => setStep(1)} onSkip={handleSkip}/>}
          {step === 1 && <Step2 L={L} selected={volume} onSelect={setVolume} onNext={() => setStep(2)} onBack={() => setStep(0)} onSkip={handleSkip}/>}
          {step === 2 && (
            <Step3
              L={L}
              volume={volume!}
              recommendedPlan={recommendedPlan}
              secondaryPlan={secondaryPlan}
              isPending={confirmMutation.isPending}
              onConfirm={() => confirmMutation.mutate(recommendedPlan)}
              onBack={() => setStep(1)}
              onSkip={handleSkip}
            />
          )}
          {step === 3 && <Step4 L={L} checked={checked} allDone={allDone} onToggle={toggleCheck} onGo={goPOS}/>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Step 1: Business Type ────────────────────────────────────────────────────
const BIZ_ICONS: Record<string, () => JSX.Element> = {
  retail: RetailIcon,
  restaurant: RestaurantIcon,
  service: ServiceIcon,
  wholesale: WholesaleIcon,
};

function Step1({ L, selected, onSelect, onNext, onSkip }: {
  L: (typeof LABELS)["en"];
  selected: string | null;
  onSelect: (v: BizType) => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{L.s1Title}</h1>
        <p className="text-gray-400 text-sm">{L.s1Sub}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
        {L.bizTypes.map(biz => {
          const Icon = BIZ_ICONS[biz.id];
          const isSelected = selected === biz.id;
          return (
            <button
              key={biz.id}
              onClick={() => onSelect(biz.id as BizType)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center group ${
                isSelected
                  ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white"/>
                </div>
              )}
              <div className={`w-14 h-14 rounded-xl p-2 transition-all ${isSelected ? "bg-white/15" : "bg-white/8 group-hover:bg-white/12"}`}>
                <Icon/>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{biz.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{biz.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onNext}
          disabled={!selected}
          className="w-full max-w-xs bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,57%)] text-white font-bold py-6 rounded-xl shadow-2xl shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {L.next} <ArrowRight className="w-4 h-4 ml-1.5"/>
        </Button>
        <button onClick={onSkip} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{L.skip}</button>
      </div>
    </div>
  );
}

// ─── Step 2: Sales Volume ─────────────────────────────────────────────────────
const VOL_ICONS: Record<string, () => JSX.Element> = {
  micro: MicroIcon,
  growth: GrowthIcon,
  high: HighVolumeIcon,
};

function Step2({ L, selected, onSelect, onNext, onBack, onSkip }: {
  L: (typeof LABELS)["en"];
  selected: string | null;
  onSelect: (v: Volume) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{L.s2Title}</h1>
        <p className="text-gray-400 text-sm">{L.s2Sub}</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {L.volumes.map(vol => {
          const Icon = VOL_ICONS[vol.id];
          const isSelected = selected === vol.id;
          return (
            <button
              key={vol.id}
              onClick={() => onSelect(vol.id as Volume)}
              className={`relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all text-left group ${
                isSelected
                  ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl p-2 flex-shrink-0 transition-all ${isSelected ? "bg-white/15" : "bg-white/8 group-hover:bg-white/12"}`}>
                <Icon/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base">{vol.label}</p>
                <p className="text-gray-400 text-sm mt-0.5">{vol.sub}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white"/>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onNext}
          disabled={!selected}
          className="w-full max-w-xs bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,57%)] text-white font-bold py-6 rounded-xl shadow-2xl shadow-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {L.next} <ArrowRight className="w-4 h-4 ml-1.5"/>
        </Button>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3"/>{L.back}
          </button>
          <span className="text-gray-600">|</span>
          <button onClick={onSkip} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{L.skip}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Plan Recommendation ─────────────────────────────────────────────
function PlanCard({
  isRecommended,
  plan,
  rate,
  pitch,
  invoiceFee,
  label,
  L,
}: {
  isRecommended: boolean;
  plan: Plan;
  rate: string;
  pitch: string;
  invoiceFee: string;
  label: string;
  L: (typeof LABELS)["en"];
}) {
  const Icon = isRecommended
    ? (plan === "percent" ? SafeNetIcon : RocketIcon)
    : null;

  return (
    <div className={`relative rounded-2xl border-2 p-5 transition-all ${
      isRecommended
        ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-xl shadow-blue-500/20"
        : "border-white/10 bg-white/5"
    }`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(217,90%,40%)] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-blue-500/30">
          {L.recommended}
        </div>
      )}
      {Icon && (
        <div className="flex justify-center mb-3">
          <div className="w-20 h-14">
            <Icon/>
          </div>
        </div>
      )}
      <div className="text-center">
        <p className="text-white font-bold text-base mb-1">{label}</p>
        <p className="text-[hsl(217,90%,60%)] text-2xl font-extrabold">{rate}</p>
        <p className="text-gray-400 text-xs mt-1">{pitch}</p>
        <p className="text-gray-500 text-xs mt-2">{invoiceFee}</p>
      </div>
    </div>
  );
}

function Step3({ L, volume, recommendedPlan, secondaryPlan, isPending, onConfirm, onBack, onSkip }: {
  L: (typeof LABELS)["en"];
  volume: Volume;
  recommendedPlan: Plan;
  secondaryPlan: Plan;
  isPending: boolean;
  onConfirm: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const titleKey  = volume === "micro" ? "s3MicroTitle"  : volume === "growth" ? "s3GrowthTitle"  : "s3HighTitle";
  const bodyKey   = volume === "micro" ? "s3MicroBody"   : volume === "growth" ? "s3GrowthBody"   : "s3HighBody";

  const planData = (p: Plan, recommended: boolean) => ({
    plan: p,
    isRecommended: recommended,
    label:     p === "percent" ? L.pctLabel  : L.flatLabel,
    rate:      p === "percent" ? L.pctRate   : L.flatRate,
    pitch:     p === "percent" ? L.pctPitch  : L.flatPitch,
    invoiceFee: L.invoiceFee,
  });

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{(L as any)[titleKey]}</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">{(L as any)[bodyKey]}</p>
      </div>

      <div className={`grid gap-4 mb-4 ${volume === "growth" ? "grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"}`}>
        <PlanCard {...planData(recommendedPlan, true)} L={L}/>
        {volume === "growth" && <PlanCard {...planData(secondaryPlan, false)} L={L}/>}
      </div>

      <p className="text-center text-xs text-gray-500 mb-6 flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3"/> {L.trialNote}
      </p>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full max-w-xs bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,57%)] text-white font-bold py-6 rounded-xl shadow-2xl shadow-blue-500/30 disabled:opacity-60"
        >
          {isPending
            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"/>{L.saving}</>
            : <>{L.confirmPlan} <ArrowRight className="w-4 h-4 ml-1.5"/></>
          }
        </Button>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3"/>{L.back}
          </button>
          <span className="text-gray-600">|</span>
          <button onClick={onSkip} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">{L.skip}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Aha Checklist ────────────────────────────────────────────────────
const CHECKLIST_ICONS: Record<string, () => JSX.Element> = {
  logo:    LogoCheckIcon,
  product: ProductCheckIcon,
  sale:    SaleCheckIcon,
  payment: PaymentCheckIcon,
};

function Step4({ L, checked, allDone, onToggle, onGo }: {
  L: (typeof LABELS)["en"];
  checked: Set<string>;
  allDone: boolean;
  onToggle: (id: string) => void;
  onGo: () => void;
}) {
  return (
    <div>
      {/* Celebration banner */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="mb-6 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 border border-[hsl(217,90%,50%)]/40 rounded-2xl p-5 text-center"
          >
            <div className="flex justify-center mb-2">
              <Sparkles className="w-6 h-6 text-[hsl(217,90%,60%)]"/>
            </div>
            <p className="text-white font-bold text-lg">{L.doneTitle}</p>
            <p className="text-gray-300 text-sm mt-1">{L.doneBody}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{L.s4Title}</h1>
        <p className="text-gray-400 text-sm">{L.s4Sub}</p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {L.checklist.map(item => {
          const Icon = CHECKLIST_ICONS[item.id];
          const isDone = checked.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                isDone
                  ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/12"
                  : "border-white/10 bg-white/5 hover:border-white/25"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl p-1.5 flex-shrink-0 transition-all ${isDone ? "bg-white/15" : "bg-white/8 group-hover:bg-white/12"}`}>
                <Icon/>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm transition-colors ${isDone ? "text-white" : "text-gray-200"}`}>{item.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                isDone ? "bg-[hsl(217,90%,50%)] border-[hsl(217,90%,50%)]" : "border-white/30"
              }`}>
                {isDone && <Check className="w-3.5 h-3.5 text-white"/>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress counter */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[hsl(217,90%,50%)] rounded-full"
            animate={{ width: `${(checked.size / 4) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs text-gray-400">{checked.size}/4</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={onGo}
          className="w-full max-w-xs bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,52%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,57%)] text-white font-bold py-6 rounded-xl shadow-2xl shadow-blue-500/30 group"
        >
          {L.goToPOS}
          <ChevronRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform"/>
        </Button>
      </div>
    </div>
  );
}
