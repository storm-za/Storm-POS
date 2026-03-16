import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Check, Percent, DollarSign, FileText, Zap, Shield } from "lucide-react";
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
      setLocation(user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
    }
  }, []);

  const confirmMutation = useMutation({
    mutationFn: async (plan: string) => {
      const response = await apiRequest("PUT", `/api/pos/user/${user.id}/payment-plan`, { plan });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("posUser", JSON.stringify(data.user));
      const dest = data.user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system";
      setLocation(dest);
    },
    onError: (error: Error) => {
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
    <div className="min-h-screen overflow-x-hidden w-full bg-gradient-to-br from-[hsl(217,30%,8%)] via-[hsl(217,25%,12%)] to-[hsl(217,20%,10%)] flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{labels.title}</h1>
          <p className="text-gray-400">{labels.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => setSelectedPlan("percent")}
            className={`relative text-left rounded-2xl p-6 border-2 transition-all ${
              selectedPlan === "percent"
                ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {selectedPlan === "percent" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{labels.percentTitle}</h3>
            <p className="text-2xl font-bold text-[hsl(217,90%,60%)] mb-1">{labels.percentRate}</p>
            <p className="text-sm text-gray-400 mb-2">{labels.percentExample}</p>
            <p className="text-xs text-gray-500">{labels.percentDesc}</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => setSelectedPlan("flat")}
            className={`relative text-left rounded-2xl p-6 border-2 transition-all ${
              selectedPlan === "flat"
                ? "border-[hsl(217,90%,50%)] bg-[hsl(217,90%,40%)]/15 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {selectedPlan === "flat" && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-[hsl(217,90%,50%)] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{labels.flatTitle}</h3>
            <p className="text-2xl font-bold text-[hsl(217,90%,60%)] mb-1">{labels.flatRate}</p>
            <p className="text-sm text-gray-400 mb-2">{labels.flatExample}</p>
            <p className="text-xs text-gray-500">{labels.flatDesc}</p>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6"
        >
          <p className="text-sm font-semibold text-white mb-3">{labels.includes}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[labels.feature1, labels.feature2, labels.feature3, labels.feature4, labels.feature5].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                <Zap className="w-3.5 h-3.5 text-[hsl(217,90%,60%)] flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-sm text-gray-400">
            <FileText className="w-3.5 h-3.5 text-[hsl(217,90%,60%)] flex-shrink-0" />
            {labels.invoiceNote}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlan || confirmMutation.isPending}
            size="lg"
            className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] text-white font-bold px-10 py-6 text-lg shadow-2xl shadow-blue-500/30 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {confirmMutation.isPending ? labels.saving : labels.confirm}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            {labels.disclaimer}
          </div>
        </motion.div>
      </div>
    </div>
  );
}