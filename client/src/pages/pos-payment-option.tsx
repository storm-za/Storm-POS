import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Percent, DollarSign, FileText, Zap, Shield, Gift } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

const t = {
  en: {
    title: "Choose Your Plan",
    subtitle: "Select a billing option that works best for your business",
    percentTitle: "Percentage Plan",
    percentRate: "0.5% per sale",
    percentExample: "e.g. R200 sale = R1.00 fee",
    percentDesc: "Ideal for businesses with smaller transaction amounts",
    flatTitle: "Flat Rate Plan",
    flatRate: "R1.00 per sale",
    flatExample: "e.g. Any sale = R1.00 fee",
    flatDesc: "Best for businesses with higher-value transactions",
    includes: "Both plans include:",
    feature1: "Unlimited products & categories",
    feature2: "Customer management",
    feature3: "Sales reports & analytics",
    feature4: "Staff accounts & permissions",
    feature5: "Receipt printing & sharing",
    invoiceNote: "Invoices & Quotes: R0.50 per document",
    confirm: "Confirm My Plan",
    disclaimer: "This choice is permanent. Contact support to change your plan.",
    selectPlan: "Select a plan to continue",
    saving: "Saving...",
    trialBadge: "7-Day Free Trial",
    trialNote: "No charges for 7 days — billing only starts after your free trial ends.",
  },
  af: {
    title: "Kies Jou Plan",
    subtitle: "Kies 'n faktuuropsie wat die beste vir jou besigheid werk",
    percentTitle: "Persentasie Plan",
    percentRate: "0.5% per verkoop",
    percentExample: "bv. R200 verkoop = R1.00 fooi",
    percentDesc: "Ideaal vir besighede met kleiner transaksie-bedrae",
    flatTitle: "Vaste Tarief Plan",
    flatRate: "R1.00 per verkoop",
    flatExample: "bv. Enige verkoop = R1.00 fooi",
    flatDesc: "Beste vir besighede met hoër-waarde transaksies",
    includes: "Beide planne sluit in:",
    feature1: "Onbeperkte produkte & kategorieë",
    feature2: "Kliëntbestuur",
    feature3: "Verkoopsverslae & ontledings",
    feature4: "Personeelrekeninge & toestemmings",
    feature5: "Kwitansiedruk & deling",
    invoiceNote: "Fakture & Kwotasies: R0.50 per dokument",
    confirm: "Bevestig My Plan",
    disclaimer: "Hierdie keuse is permanent. Kontak ondersteuning om jou plan te verander.",
    selectPlan: "Kies 'n plan om voort te gaan",
    saving: "Stoor...",
    trialBadge: "7-Dag Gratis Proeftydperk",
    trialNote: "Geen koste vir 7 dae — fakturering begin eers na jou gratis proeftydperk.",
  },
};

export default function PosPaymentOption() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<"percent" | "flat" | null>(null);
  const { toast } = useToast();

  const user = (() => {
    try {
      const raw = localStorage.getItem("posUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const lang = user?.preferredLanguage === "af" ? "af" : "en";
  const labels = t[lang];

  useEffect(() => {
    updatePageSEO({
      title: "Choose Your Plan - Storm POS",
      description: "Select a billing plan for your Storm POS account.",
      canonical: window.location.origin + "/pos/payment-option",
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setLocation("/pos/login");
      return;
    }
    if (user.paymentOptionSelected) {
      if (user.paid) {
        setLocation(user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
      } else {
        setLocation("/pos/inactive");
      }
    }
  }, []);

  const confirmMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("PUT", `/api/pos/user/${user.id}/payment-plan`, { plan, userEmail: user.email });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("posUser", JSON.stringify(data.user));
      if (data.user.paid) {
        setLocation(data.user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
      } else {
        setLocation("/pos/inactive");
      }
    },
    onError: (error: Error) => {
      if (error.message.includes("already been selected")) {
        const updatedUser = { ...user, paymentOptionSelected: true };
        localStorage.setItem("posUser", JSON.stringify(updatedUser));
        if (updatedUser.paid) {
          setLocation(updatedUser.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
        } else {
          setLocation("/pos/inactive");
        }
        return;
      }
      toast({ title: lang === "af" ? "Fout" : "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleConfirm = () => {
    if (!selectedPlan) {
      toast({ title: labels.selectPlan, variant: "destructive" });
      return;
    }
    confirmMutation.mutate(selectedPlan);
  };

  if (!user) return null;

  return (
    <div className="h-screen overflow-hidden w-full bg-gradient-to-br from-[hsl(217,30%,8%)] via-[hsl(217,25%,12%)] to-[hsl(217,20%,10%)] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-4 md:mb-5">
          <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 text-green-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
            <Gift className="w-3.5 h-3.5" />
            {labels.trialBadge}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{labels.title}</h1>
          <p className="text-sm text-gray-400">{labels.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-4">
          <button
            onClick={() => setSelectedPlan("percent")}
            className={`relative text-left rounded-xl p-3 md:p-5 border-2 transition-all flex items-center gap-3 md:block ${
              selectedPlan === "percent"
                ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {selectedPlan === "percent" && (
              <div className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-lg flex items-center justify-center flex-shrink-0 md:mb-2 shadow-lg shadow-blue-500/20">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold text-white">{labels.percentTitle}</h3>
              <p className="text-base md:text-xl font-bold text-[hsl(217,90%,60%)]">{labels.percentRate}</p>
              <p className="text-xs text-gray-400">{labels.percentExample}</p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden md:block">{labels.percentDesc}</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedPlan("flat")}
            className={`relative text-left rounded-xl p-3 md:p-5 border-2 transition-all flex items-center gap-3 md:block ${
              selectedPlan === "flat"
                ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {selectedPlan === "flat" && (
              <div className="absolute top-2 right-2 md:top-3 md:right-3 w-5 h-5 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-lg flex items-center justify-center flex-shrink-0 md:mb-2 shadow-lg shadow-blue-500/20">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold text-white">{labels.flatTitle}</h3>
              <p className="text-base md:text-xl font-bold text-[hsl(217,90%,60%)]">{labels.flatRate}</p>
              <p className="text-xs text-gray-400">{labels.flatExample}</p>
              <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 hidden md:block">{labels.flatDesc}</p>
            </div>
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 md:p-4 mb-3 md:mb-4">
          <p className="text-xs font-semibold text-white mb-2">{labels.includes}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {[labels.feature1, labels.feature2, labels.feature3, labels.feature4, labels.feature5].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300">
                <Zap className="w-3 h-3 text-[hsl(217,90%,60%)] flex-shrink-0" />
                {f}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <FileText className="w-3 h-3 text-[hsl(217,90%,60%)] flex-shrink-0" />
              {labels.invoiceNote}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlan || confirmMutation.isPending}
            className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] text-white font-bold px-8 py-5 text-base shadow-2xl shadow-blue-500/30 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {confirmMutation.isPending ? labels.saving : labels.confirm}
          </Button>
          <p className="mt-2 text-xs text-green-400/80 font-medium">{labels.trialNote}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] md:text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            {labels.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}