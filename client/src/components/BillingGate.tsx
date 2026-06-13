import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/queryClient";

type BillingStatus = "trial" | "active" | "grace" | "suspended";

function resolveTier(user: any): string {
  const raw = user?.subscriptionTier ?? user?.paymentPlan;
  if (!raw || raw === 'percent' || raw === 'flat') return 'starter';
  if (['starter', 'growth', 'scale'].includes(raw)) return raw;
  return 'starter';
}

function computeBillingStatus(user: any): { status: BillingStatus; graceEnd: Date | null } {
  if (!user) return { status: "active", graceEnd: null };

  const now = new Date();

  if (user.trialStartDate) {
    const trialEnd = new Date(new Date(user.trialStartDate).getTime() + 7 * 24 * 60 * 60 * 1000);
    if (now < trialEnd) return { status: "trial", graceEnd: null };
  }

  if (user.paid) {
    if (!user.paidUntil || now < new Date(user.paidUntil)) return { status: "active", graceEnd: null };
  }

  const graceStart: Date | null = user.paidUntil
    ? new Date(user.paidUntil)
    : user.subscriptionStartDate
      ? new Date(user.subscriptionStartDate)
      : user.trialStartDate
        ? new Date(new Date(user.trialStartDate).getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

  if (graceStart) {
    const graceEnd = new Date(graceStart.getTime() + 3 * 24 * 60 * 60 * 1000);
    if (now < graceEnd) return { status: "grace", graceEnd };
  }

  return { status: "suspended", graceEnd: null };
}

function daysHoursRemaining(end: Date): { days: number; hours: number } {
  const ms = Math.max(0, end.getTime() - Date.now());
  const totalHours = Math.floor(ms / (1000 * 60 * 60));
  return { days: Math.floor(totalHours / 24), hours: totalHours % 24 };
}

const PLAN_AMOUNTS: Record<string, number> = { starter: 299, growth: 599, scale: 999 };
const PLAN_LABELS: Record<string, string> = { starter: "Starter", growth: "Growth", scale: "Scale" };

const BANK = [
  { label: "Account Holder", labelAF: "Rekeninghouer", value: "Storm", copy: false },
  { label: "Bank", labelAF: "Bank", value: "Nedbank", copy: false },
  { label: "Account Number", labelAF: "Rekeningnommer", value: "1229368612", copy: true },
  { label: "Account Type", labelAF: "Rekeningtipe", value: "Current Account", copy: false },
  { label: "Branch Code", labelAF: "Takkode", value: "198765", copy: true },
];

interface BillingGateProps {
  user: any;
  lang?: "en" | "af";
}

const LABELS = {
  en: {
    graceTitle: "Your free trial has ended",
    graceSub: "You have a 3-day grace period to make your EFT payment and notify Storm.",
    suspendedTitle: "Subscription Expired",
    suspendedSub: "Your account has been suspended. Please make an EFT payment to restore access.",
    plan: "Your plan",
    monthly: "/month",
    bankingRef: "Your payment reference",
    bankDetails: "EFT Banking Details",
    daysLeft: (d: number, h: number) => d > 0 ? `${d} day${d !== 1 ? 's' : ''} ${h}h remaining` : `${h} hour${h !== 1 ? 's' : ''} remaining`,
    gracePeriod: "Grace Period",
    notifyBtn: "I've Paid — Notify Storm",
    notifying: "Sending...",
    notified: "Notification Sent!",
    notifiedSub: "Storm will verify your payment and reactivate your account within 24 hours.",
    dismiss: "Continue for Now",
    logout: "Log Out",
    support: "Contact Support",
    copied: "Copied to clipboard",
    copyError: "Copy failed — please copy manually",
    notifyError: "Failed to send — please email softwarebystorm@gmail.com directly.",
  },
  af: {
    graceTitle: "Jou gratis proeftyd het geëindig",
    graceSub: "Jy het 'n 3-dag-grasietydperk om jou EFT-betaling te maak en Storm in kennis te stel.",
    suspendedTitle: "Intekening Verval",
    suspendedSub: "Jou rekening is opgeskort. Maak asseblief 'n EFT-betaling om toegang te herstel.",
    plan: "Jou plan",
    monthly: "/maand",
    bankingRef: "Jou betalingsverwysingsnommer",
    bankDetails: "EFT Bankbesonderhede",
    daysLeft: (d: number, h: number) => d > 0 ? `${d} dag${d !== 1 ? 'e' : ''} ${h}u oor` : `${h} uur oor`,
    gracePeriod: "Grasietydperk",
    notifyBtn: "Ek Het Betaal — Verwittig Storm",
    notifying: "Stuur...",
    notified: "Kennisgewing Gestuur!",
    notifiedSub: "Storm sal jou betaling verifieer en jou rekening binne 24 uur hernu.",
    dismiss: "Gaan Voorlopig Voort",
    logout: "Teken Uit",
    support: "Kontak Ondersteuning",
    copied: "Na knipbord gekopieer",
    copyError: "Kopieer misluk — kopieer asseblief handmatig",
    notifyError: "Kennisgewing misluk — epos softwarebystorm@gmail.com direk.",
  },
};

export function BillingGate({ user, lang = "en" }: BillingGateProps) {
  const [dismissed, setDismissed] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const { toast } = useToast();
  const L = LABELS[lang] ?? LABELS.en;

  const { status, graceEnd } = computeBillingStatus(user);

  if (status === "trial" || status === "active") return null;
  if (status === "grace" && dismissed) return null;

  const tier = resolveTier(user);
  const amount = PLAN_AMOUNTS[tier] ?? 299;
  const planLabel = PLAN_LABELS[tier] ?? "Starter";
  const ref = `STORM-${user?.id ?? "?"}-POS`;
  const isGrace = status === "grace";
  const countdown = isGrace && graceEnd ? daysHoursRemaining(graceEnd) : null;

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
          plan: tier,
        }),
      });
      if (res.ok) {
        setNotified(true);
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

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
        isGrace ? "bg-black/75 backdrop-blur-sm" : "bg-gray-950"
      }`}
    >
      <div className="w-full max-w-[420px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`px-5 py-4 flex items-start gap-3 ${isGrace ? "bg-amber-950/60 border-b border-amber-800/40" : "bg-red-950/60 border-b border-red-800/40"}`}>
          <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${isGrace ? "bg-amber-500/20" : "bg-red-500/20"}`}>
            {isGrace ? "⏳" : "🔒"}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">{isGrace ? L.graceTitle : L.suspendedTitle}</h2>
            <p className={`text-sm mt-1 leading-snug ${isGrace ? "text-amber-300/90" : "text-red-300/90"}`}>
              {isGrace ? L.graceSub : L.suspendedSub}
            </p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">

          {/* Plan row + countdown */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">{L.plan}</p>
                <p className="text-white font-bold text-sm mt-0.5">{planLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-[hsl(217,90%,60%)] font-bold text-xl">R{amount}</p>
                <p className="text-gray-400 text-[10px]">{L.monthly}</p>
              </div>
            </div>
            {isGrace && countdown && (
              <div className="bg-amber-900/40 border border-amber-700/40 rounded-xl px-3 py-3 text-center min-w-[90px]">
                <p className="text-amber-300 font-bold text-lg leading-none">{countdown.days}d {countdown.hours}h</p>
                <p className="text-amber-400/70 text-[10px] mt-1 font-medium uppercase tracking-wide">{L.gracePeriod}</p>
              </div>
            )}
          </div>

          {/* Banking details */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700 flex items-center gap-2">
              <span className="text-base">🏦</span>
              <span className="text-white text-sm font-semibold">{L.bankDetails}</span>
            </div>
            <div className="divide-y divide-gray-700/60">
              {BANK.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-4 py-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                      {lang === "af" ? item.labelAF : item.label}
                    </p>
                    <p className={`text-white text-sm ${item.copy ? "font-mono" : ""}`}>{item.value}</p>
                  </div>
                  {item.copy && (
                    <button
                      onClick={() => handleCopy(item.value)}
                      className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                      title={`Copy ${item.label}`}
                      aria-label={`Copy ${item.label}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment reference */}
          <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{L.bankingRef}</p>
              <p className="text-[hsl(217,90%,60%)] font-mono font-bold text-sm mt-0.5">{ref}</p>
            </div>
            <button
              onClick={() => handleCopy(ref)}
              className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Copy payment reference"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Notify button / success state */}
          {notified ? (
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-green-400 text-base mt-0.5">✓</span>
              <div>
                <p className="text-green-300 font-semibold text-sm">{L.notified}</p>
                <p className="text-green-400/70 text-xs mt-0.5">{L.notifiedSub}</p>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleNotify}
              disabled={notifying}
              className="w-full bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,33%)] text-white font-semibold h-10 rounded-xl"
            >
              {notifying ? L.notifying : `✉ ${L.notifyBtn}`}
            </Button>
          )}

          {/* Action row */}
          <div className="flex gap-2 pt-0.5">
            {isGrace && (
              <Button
                variant="outline"
                onClick={() => setDismissed(true)}
                className="flex-1 border-gray-600/60 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent h-9 text-sm rounded-xl"
              >
                {L.dismiss}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={`${isGrace ? "flex-1" : "w-full"} text-gray-400 hover:text-white hover:bg-gray-800 h-9 text-sm rounded-xl`}
            >
              {L.logout}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500 pb-0.5">
            <a
              href="mailto:softwarebystorm@gmail.com?subject=Storm POS Subscription Help"
              className="text-[hsl(217,90%,55%)] hover:underline"
            >
              {L.support} — softwarebystorm@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
