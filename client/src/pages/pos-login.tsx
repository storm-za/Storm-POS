import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, ArrowLeft, Check, Shield, Cloud, Zap } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

const REMEMBER_EMAIL_KEY  = "posRememberedEmail";
const REMEMBER_PASS_KEY   = "posRememberedPass";
const REMEMBER_FLAG_KEY   = "posRememberMe";
const SESSION_TTL_MS      = 7 * 24 * 60 * 60 * 1000;

function saveRemembered(email: string, password: string) {
  localStorage.setItem(REMEMBER_FLAG_KEY, "1");
  localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  localStorage.setItem(REMEMBER_PASS_KEY, btoa(password));
}

function clearRemembered() {
  localStorage.removeItem(REMEMBER_FLAG_KEY);
  localStorage.removeItem(REMEMBER_EMAIL_KEY);
  localStorage.removeItem(REMEMBER_PASS_KEY);
}

function loadRemembered(): { email: string; password: string } | null {
  if (localStorage.getItem(REMEMBER_FLAG_KEY) !== "1") return null;
  const email   = localStorage.getItem(REMEMBER_EMAIL_KEY);
  const passB64 = localStorage.getItem(REMEMBER_PASS_KEY);
  if (!email || !passB64) return null;
  try { return { email, password: atob(passB64) }; } catch { return null; }
}

function getActiveSession(): { user: any; destination: string } | null {
  try {
    const raw = localStorage.getItem("posUser");
    const ts  = parseInt(localStorage.getItem("posLoginTimestamp") || "0", 10);
    if (!raw || !ts) return null;
    if (Date.now() - ts > SESSION_TTL_MS) return null;
    const user = JSON.parse(raw);
    let destination = "/pos/inactive";
    if (!user.paymentOptionSelected) {
      destination = "/pos/payment-option";
    } else if (user.paid) {
      destination = user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system";
    }
    return { user, destination };
  } catch {
    return null;
  }
}

const highlights = [
  { icon: Zap,    text: "Real-time sales & inventory" },
  { icon: Cloud,  text: "Cloud-synced across all devices" },
  { icon: Shield, text: "Bank-grade security & encryption" },
  { icon: Check,  text: "No monthly fees - pay per sale" },
];

export default function PosLogin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updatePageSEO({
      title: "Login - Storm POS | Access Your Point of Sale System",
      description: "Log in to your Storm POS account. Manage sales, inventory, customers, and reports from any device. Secure cloud-based access.",
      canonical: window.location.origin + "/pos/login",
    });
  }, []);

  const activeSession = getActiveSession();
  const saved = loadRemembered();

  const [email, setEmail]               = useState(saved?.email ?? "");
  const [password, setPassword]         = useState(saved?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(!!saved);
  const autoSubmitted                   = useRef(false);
  const { toast }                       = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/pos/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (rememberMe) {
        saveRemembered(email, password);
      } else {
        clearRemembered();
      }
      localStorage.setItem("posUser", JSON.stringify(data.user));
      localStorage.setItem("posLoginTimestamp", Date.now().toString());
      if (!data.user.paymentOptionSelected) {
        setLocation("/pos/payment-option");
      } else if (data.user.paid) {
        setLocation(data.user.preferredLanguage === "af" ? "/pos/system/afrikaans" : "/pos/system");
      } else {
        setLocation("/pos/inactive");
      }
    },
    onError: (error: Error) => {
      autoSubmitted.current = false;
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (activeSession) { setLocation(activeSession.destination); return; }
    if (saved && !autoSubmitted.current) {
      autoSubmitted.current = true;
      loginMutation.mutate({ email: saved.email, password: saved.password });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing information", description: "Please enter both email and password", variant: "destructive" });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const isAutoLoading = (activeSession !== null) || (loginMutation.isPending && autoSubmitted.current);

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-[hsl(217,90%,32%)] via-[hsl(217,90%,38%)] to-[hsl(217,90%,28%)] p-12 relative overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* glow orbs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <a href="/pos" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />Back to Storm POS
          </a>
          <div className="mb-10 inline-flex items-center justify-center bg-white rounded-2xl p-3 shadow-lg">
            <img src="/storm-logo.png" alt="Storm POS" className="h-10 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Your entire business,<br />in one place.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Cloud-powered point of sale built for South African retailers. Sell, invoice and manage stock from any device.
          </p>

          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs">Storm Software &copy; {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">

        {/* mobile logo + back */}
        <div className="lg:hidden w-full max-w-sm mb-8">
          <a href="/pos" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" />Back
          </a>
          <img src="/storm-logo.png" alt="Storm POS" className="h-10 w-auto mb-1" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your Storm POS account</p>
          </div>

          {isAutoLoading ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-10 h-10 border-[3px] border-[hsl(217,90%,40%)] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                {activeSession ? "Resuming your session..." : "Logging you in automatically..."}
              </p>
              {!activeSession && (
                <button
                  type="button"
                  onClick={() => {
                    autoSubmitted.current = false;
                    clearRemembered();
                    setRememberMe(false);
                    loginMutation.reset();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
                >
                  Cancel and sign in manually
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11 pr-10 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => {
                    setRememberMe(!!checked);
                    if (!checked) clearRemembered();
                  }}
                  className="border-gray-300 data-[state=checked]:bg-[hsl(217,90%,40%)] data-[state=checked]:border-[hsl(217,90%,40%)] rounded"
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none font-normal">
                  Keep me signed in for 7 days
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in...</span>
                ) : "Sign In"}
              </Button>
            </form>
          )}

          {!isAutoLoading && (
            <p className="mt-7 text-center text-sm text-gray-500">
              No account yet?{" "}
              <a href="/pos/signup" className="text-[hsl(217,90%,40%)] hover:underline font-medium">
                Start your free trial
              </a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
