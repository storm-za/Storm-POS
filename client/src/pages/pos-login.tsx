import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function PosLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/pos/login", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user.paid) {
        toast({
          title: "Login successful",
          description: "Welcome to Storm POS!",
        });
        setLocation("/pos/system");
      } else {
        setLocation("/pos/inactive");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
              <p className="text-blue-100">Sign in to your account</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
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

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Demo Account: demo@storm.co.za / demo123
                </AlertDescription>
              </Alert>
              
              <Button
                type="submit"
                className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need access?{" "}
                <a 
                  href="mailto:stormmailcompany@gmail.com" 
                  className="text-[hsl(217,90%,40%)] hover:underline font-medium"
                >
                  Contact Support
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