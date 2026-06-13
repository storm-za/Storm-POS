import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard, Copy, Warning as AlertTriangle, Envelope as Mail,
  SignOut as LogOut, CheckCircle, Clock, Lock
} from "@phosphor-icons/react";
import { apiFetch } from "@/lib/queryClient";

type BillingStatus = "trial" | "active" | "grace" | "suspended";

function computeBillingStatus(user: any): BillingStatus {
  if (!user) return "active";

  const now = new Date();

  if (user.trialStartDate) {
    const trialEnd = new Date(new Date(user.trialStartDate).getTime() + 7 * 24 * 60 * 60 * 1000);
    if (now < trialEnd) return "trial";
  }

  if (user.paid) {
    if (!user.paidUntil || now < new Date(user.paidUntil)) return "active";
  }

  const graceStart = user.paidUntil
    ? new Date(user.paidUntil)
    : user.subscriptionStartDate
      ? new Date(user.subscriptionStartDate)
      : user.trialStartDate
        ? new Date(new Date(user.trialStartDate).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

  if (graceStart) {
    const graceEnd = new Date(graceStart.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now < graceEnd) return "grace";
  }

  return "suspended";
}

const PLAN_AMOUNTS: Record<string, number> = { starter: 299, growth: 599, scale: 999 };
const PLAN_LABELS: Record<string, string> = { starter: "Starter", growth: "Growth", scale: "Scale" };

const BANK = [
  { label: "Account Holder", value: "Storm", copy: false },
  { label: "Bank", value: "Nedbank", copy: false },
  { label: "Account Number", value: "1229368612", copy: true },
  { label: "Account Type", value: "Current Account", copy: false },
  { label: "Branch Code", value: "198765", copy: true },
];

interface BillingGateProps {
  user: any;
  lang?: "en" | "af";
}

const LABELS = {
  en: {
    trialBadge: "Trial Active",
    graceTitle: "Your free trial has ended",
    graceSub: "You have a 3-day grace period to make your EFT payment and notify us. During this time you can still use the POS.",
    suspendedTitle: "Subscription Expired",
    suspendedSub: "Your access has been suspended. Please make an EFT payment to reactivate.",
    plan: "Your plan",
    monthly: "/month",
    bankingRef: "Your banking reference",
    bankDetails: "Banking Details",
    notifyBtn: "I've Paid — Notify Storm",
    notifying: "Sending...",
    notified: "Notification Sent!",
    notifiedSub: "Storm will verify your payment and activate your account within 24 hours.",
    dismiss: "Continue for Now",
    logout: "Log Out",
    support: "Contact Support",
    copied: "Copied!",
    copyError: "Copy failed",
    notifySuccess: "Payment notification sent! Storm will activate your account within 24 hours.",
    notifyError: "Failed to send notification. Please email softwarebystorm@gmail.com directly.",
  },
  af: {
    trialBadge: "Proeftyd Aktief",
    graceTitle: "Jou gratis proeftyd het geëindig",
    graceSub: "Jy het 'n 3-dag-grasietydperk om jou EFT-betaling te maak en ons in kennis te stel. Gedurende hierdie tyd kan jy steeds die POS gebruik.",
    suspendedTitle: "Intekening Verval",
    suspendedSub: "Jou toegang is opgeskort. Maak asseblief 'n EFT-betaling om te hernu.",
    plan: "Jou plan",
    monthly: "/maand",
    bankingRef: "Jou bankverwysingsnommer",
    bankDetails: "Bankbesonderhede",
    notifyBtn: "Ek Het Betaal — Verwittig Storm",
    notifying: "Stuur...",
    notified: "Kennisgewing Gestuur!",
    notifiedSub: "Storm sal jou betaling verifieer en jou rekening binne 24 uur aktiveer.",
    dismiss: "Gaan Voorlopig Voort",
    logout: "Teken Uit",
    support: "Kontak Ondersteuning",
    copied: "Gekopieer!",
    copyError: "Kopieer misluk",
    notifySuccess: "Betaalkennisgewing gestuur! Storm sal jou rekening binne 24 uur aktiveer.",
    notifyError: "Kennisgewing misluk. Epos asseblief softwarebystorm@gmail.com direk.",
  },
};

export function BillingGate({ user, lang = "en" }: BillingGateProps) {
  const [dismissed, setDismissed] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const { toast } = useToast();
  const L = LABELS[lang] || LABELS.en;

  const status = computeBillingStatus(user);

  if (status === "trial" || status === "active") return null;
  if (status === "grace" && dismissed) return null;

  const plan = user?.paymentPlan || "starter";
  const amount = PLAN_AMOUNTS[plan] ?? 299;
  const planLabel = PLAN_LABELS[plan] ?? "Starter";
  const ref = `STORM-${user?.id ?? "?"}-POS`;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value)
      .then(() => toast({ description: L.copied }))
      .catch(() => toast({ description: L.copyError, variant: "destructive" }));
  };

  const handleNotify = async () => {
    if (!user?.id || !user?.email) return;
    setNotifying(true);
    try {
      const res = await apiFetch("/api/pos/notify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          companyName: user.companyName,
          plan,
        }),
      });
      if (res.ok) {
        setNotified(true);
        toast({ description: L.notifySuccess });
      } else {
        toast({ description: L.notifyError, variant: "destructive" });
      }
    } catch {
      toast({ description: L.notifyError, variant: "destructive" });
    } finally {
      setNotifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("posUser");
    window.location.href = "/pos/login";
  };

  const isGrace = status === "grace";

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
        isGrace ? "bg-black/70 backdrop-blur-sm" : "bg-gray-950"
      }`}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-5 flex items-center gap-4 ${isGrace ? "bg-amber-900/40 border-b border-amber-700/30" : "bg-red-900/40 border-b border-red-700/30"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isGrace ? "bg-amber-500/20" : "bg-red-500/20"}`}>
            {isGrace ? (
              <Clock className="w-6 h-6 text-amber-400" />
            ) : (
              <Lock className="w-6 h-6 text-red-400" />
            )}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              {isGrace ? L.graceTitle : L.suspendedTitle}
            </h2>
            <p className={`text-sm mt-0.5 ${isGrace ? "text-amber-300" : "text-red-300"}`}>
              {isGrace ? L.graceSub : L.suspendedSub}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Plan & amount */}
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{L.plan}</p>
              <p className="text-white font-bold mt-0.5">{planLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-[hsl(217,90%,60%)] font-bold text-xl">R{amount}</p>
              <p className="text-gray-400 text-xs">{L.monthly}</p>
            </div>
          </div>

          {/* Banking details */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[hsl(217,90%,60%)]" />
              <span className="text-white text-sm font-semibold">{L.bankDetails}</span>
            </div>
            <div className="divide-y divide-gray-700">
              {BANK.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{item.label}</p>
                    <p className={`text-white text-sm font-medium ${item.copy ? "font-mono" : ""}`}>{item.value}</p>
                  </div>
                  {item.copy && (
                    <button
                      onClick={() => handleCopy(item.value)}
                      className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                      title={`Copy ${item.label}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Banking reference */}
          <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{L.bankingRef}</p>
              <p className="text-[hsl(217,90%,60%)] font-mono font-bold text-sm mt-0.5">{ref}</p>
            </div>
            <button
              onClick={() => handleCopy(ref)}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
              title="Copy reference"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Notify button */}
          {notified ? (
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-300 font-semibold text-sm">{L.notified}</p>
                <p className="text-green-400/70 text-xs mt-0.5">{L.notifiedSub}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleNotify}
              disabled={notifying}
              className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold h-11"
            >
              {notifying ? L.notifying : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {L.notifyBtn}
                </>
              )}
            </Button>
          )}

          {/* Actions row */}
          <div className="flex gap-2">
            {isGrace && (
              <Button
                variant="outline"
                onClick={() => setDismissed(true)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent h-9 text-sm"
              >
                {L.dismiss}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex-1 text-gray-400 hover:text-white hover:bg-gray-800 h-9 text-sm"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              {L.logout}
            </Button>
          </div>

          {/* Support link */}
          <p className="text-center text-xs text-gray-500">
            <a
              href="mailto:softwarebystorm@gmail.com?subject=Storm POS Subscription"
              className="text-[hsl(217,90%,60%)] hover:underline"
            >
              <Mail className="w-3 h-3 inline mr-1" />
              {L.support}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
