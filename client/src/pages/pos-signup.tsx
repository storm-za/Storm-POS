import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeSlash as EyeOff, ArrowLeft, Check, RocketLaunch as Zap } from "@phosphor-icons/react";
import { updatePageSEO } from "@/lib/seo";

const perks = [
  "7 days completely free - no card needed",
  "Real-time sales, stock and customers",
  "Professional invoices & quotes (PDF)",
  "Works on any phone, tablet or laptop",
  "Full Afrikaans & English support",
];

export default function PosSignup() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updatePageSEO({
      title: 'Sign Up - Storm POS | Start Your 7-Day Free Trial',
      description: 'Create your Storm POS account today. 7 days completely free, then only pay 0.5% per sale. No credit card required. No monthly fees. Start selling now.',
      canonical: window.location.origin + '/pos/signup'
    });
  }, []);

  const [firstName, setFirstName]               = useState("");
  const [lastName, setLastName]                 = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [companyName, setCompanyName]           = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [showPassword, setShowPassword]         = useState(false);
  const { toast }                               = useToast();

  const signupMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; password: string; companyName: string; preferredLanguage: string }) => {
      const response = await apiRequest("POST", "/api/pos/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('posUser', JSON.stringify(data.user));
      localStorage.setItem('posLoginTimestamp', Date.now().toString());
      setLocation("/pos/onboarding");
    },
    onError: (error: Error) => {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !companyName) {
      toast({ title: "Missing information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    signupMutation.mutate({ firstName, lastName, email, password, companyName, preferredLanguage });
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between bg-gradient-to-br from-[hsl(217,90%,32%)] via-[hsl(217,90%,38%)] to-[hsl(217,90%,28%)] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <a href="/pos" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors mb-12">
            <ArrowLeft className="w-4 h-4" />Back to Storm POS
          </a>
          <div className="mb-10 w-fit bg-white rounded-2xl p-3 shadow-lg">
            <img src="/storm-logo.png" alt="Storm POS" className="h-10 w-auto block" />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />7-Day Free Trial - No credit card required
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Everything you need<br />to run your business.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Join hundreds of South African retailers who manage their entire business with Storm POS.
          </p>

          <ul className="space-y-3.5">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-300" />
                </div>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs">Storm Software &copy; {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white overflow-y-auto">

        {/* mobile logo + back */}
        <div className="lg:hidden w-full max-w-sm mb-6">
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
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start your 7-day free trial - no card needed</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="h-11 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="h-11 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">Company name</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your business name"
                className="h-11 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm"
                required
              />
            </div>

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
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
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

            <div className="space-y-1.5">
              <Label htmlFor="preferredLanguage" className="text-sm font-medium text-gray-700">
                Preferred language / Voorkeur taal
              </Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-[hsl(217,90%,40%)] focus:ring-[hsl(217,90%,40%)] rounded-lg text-sm">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2"><span>🇿🇦</span><span>English</span></div>
                  </SelectItem>
                  <SelectItem value="af">
                    <div className="flex items-center gap-2"><span>🇿🇦</span><span>Afrikaans</span></div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold rounded-lg text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all mt-2"
              disabled={signupMutation.isPending}
              data-testid="button-signup"
            >
              {signupMutation.isPending ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account...</span>
              ) : "Start Free Trial"}
            </Button>

            <p className="text-center text-xs text-gray-400 leading-relaxed pt-1">
              By signing up you agree to our terms of service. After 7 days: 0.5% per sale or R1 flat per sale.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/pos/login" className="text-[hsl(217,90%,40%)] hover:underline font-medium">
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
