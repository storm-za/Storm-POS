import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Eye, EyeOff, Lock, Mail, User, Building, Globe } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

export default function PosSignup() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    updatePageSEO({
      title: 'Sign Up - Storm POS | Start Your 7-Day Free Trial',
      description: 'Create your Storm POS account today. 7 days completely free, then only pay 0.5% per sale. No credit card required. No monthly fees. Start selling now.',
      canonical: window.location.origin + '/pos/signup'
    });
  }, []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (userData: { firstName: string; lastName: string; email: string; password: string; companyName: string; preferredLanguage: string }) => {
      const response = await apiRequest("POST", "/api/pos/signup", userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('posUser', JSON.stringify(data.user));
      toast({
        title: "Account created successfully!",
        description: "Welcome to Storm POS - Your 7-day free trial has started!",
      });
      // Redirect based on preferred language
      if (data.user.preferredLanguage === 'af') {
        setLocation("/pos/stelsel");
      } else {
        setLocation("/pos/system");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !companyName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    signupMutation.mutate({ firstName, lastName, email, password, companyName, preferredLanguage });
  };

  if (signupSuccess) {
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
                <User className="h-8 w-8 text-[hsl(217,90%,40%)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Account Created!</h1>
                <p className="text-blue-100">Welcome to Storm POS</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <p className="text-gray-600">
                  Your account has been created successfully! You can now sign in with your credentials.
                </p>
                <Button
                  onClick={() => setLocation("/pos/login")}
                  className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
                >
                  Log In
                </Button>
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
              <User className="h-8 w-8 text-[hsl(217,90%,40%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Start Your Free Trial</h1>
              <p className="text-blue-100">7 days free - No credit card required</p>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                  Company Name
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
              
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

              <div className="space-y-2">
                <Label htmlFor="preferredLanguage" className="text-sm font-medium text-gray-700">
                  Preferred Language / Voorkeur Taal
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <span>🇿🇦</span>
                          <span>English</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="af">
                        <div className="flex items-center gap-2">
                          <span>🇿🇦</span>
                          <span>Afrikaans</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full h-12 bg-[hsl(217,90%,40%)] hover:bg-[hsl(217,90%,35%)] text-white font-semibold"
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating Account..." : "Start Free Trial"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a 
                  href="/pos/login" 
                  className="text-[hsl(217,90%,40%)] hover:underline font-medium"
                >
                  Sign In
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