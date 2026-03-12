import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

const REMEMBER_EMAIL_KEY = "posRememberedEmail";
const REMEMBER_PASS_KEY  = "posRememberedPass";
const REMEMBER_FLAG_KEY  = "posRememberMe";

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
  const email = localStorage.getItem(REMEMBER_EMAIL_KEY);
  const passB64 = localStorage.getItem(REMEMBER_PASS_KEY);
  if (!email || !passB64) return null;
  try {
    return { email, password: atob(passB64) };
  } catch {
    return null;
  }
}

export default function PosLogin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updatePageSEO({
      title: 'Login - Storm POS | Access Your Point of Sale System',
      description: 'Log in to your Storm POS account. Manage sales, inventory, customers, and reports from any device. Secure cloud-based access.',
      canonical: window.location.origin + '/pos/login'
    });
  }, []);

  const saved = loadRemembered();
  const [email, setEmail]             = useState(saved?.email ?? "");
  const [password, setPassword]       = useState(saved?.password ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(!!saved);
  const autoSubmitted = useRef(false);
  const { toast } = useToast();

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
      localStorage.setItem('posUser', JSON.stringify(data.user));
      localStorage.setItem('posLoginTimestamp', Date.now().toString());

      if (data.user.paid) {
        if (data.user.preferredLanguage === 'af') {
          setLocation("/pos/system/afrikaans");
        } else {
          setLocation("/pos/system");
        }
      } else {
        setLocation("/pos/inactive");
      }
    },
    onError: (error: Error) => {
      autoSubmitted.current = false;
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (saved && !autoSubmitted.current) {
      autoSubmitted.current = true;
      loginMutation.mutate({ email: saved.email, password: saved.password });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,54%)] text-white rounded-t-lg">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-[hsl(217,90%,40%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Storm POS</h1>
              <p className="text-blue-100">
                {loginMutation.isPending && autoSubmitted.current
                  ? "Signing you in..."
                  : "Sign in to your account"}
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {loginMutation.isPending && autoSubmitted.current ? (
              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-10 h-10 border-4 border-[hsl(217,90%,40%)] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Logging you in automatically...</p>
                <button
                  type="button"
                  onClick={() => {
                    autoSubmitted.current = false;
                    clearRemembered();
                    setRememberMe(false);
                    loginMutation.reset();
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline mt-2"
                >
                  Cancel & sign in manually
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => {
                      setRememberMe(!!checked);
                      if (!checked) clearRemembered();
                    }}
                    className="border-gray-300 data-[state=checked]:bg-[hsl(217,90%,40%)] data-[state=checked]:border-[hsl(217,90%,40%)]"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Save info for next time?
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/pos/signup"
                  className="text-[hsl(217,90%,40%)] hover:underline font-medium"
                >
                  Create an Account for free
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a
            href="/pos"
            className="text-sm text-gray-600 hover:text-[hsl(217,90%,40%)] hover:underline"
          >
            ← Back to POS Info
          </a>
        </div>
      </motion.div>
    </div>
  );
}
