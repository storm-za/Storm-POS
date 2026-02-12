import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight, Shield, Zap, BarChart3 } from "lucide-react";
import { updatePageSEO } from "@/lib/seo";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function PosSignupSuccess() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Welcome to Storm POS - Account Created Successfully',
      description: 'Your Storm POS account has been created. Start managing your business with our powerful point of sale system.',
      canonical: window.location.origin + '/pos/signup/success'
    });

    const storedUser = localStorage.getItem('posUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': 'GT-T5P8RL35',
        'event_category': 'signup',
        'event_label': 'pos_account_created',
        'value': 1
      });
      window.gtag('event', 'sign_up', {
        method: 'email'
      });
    }
  }, []);

  const handleGoToPOS = () => {
    if (user?.preferredLanguage === 'af') {
      setLocation("/pos/system/afrikaans");
    } else {
      setLocation("/pos/system");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full bg-gradient-to-br from-[hsl(217,30%,8%)] via-[hsl(217,25%,12%)] to-[hsl(217,20%,10%)] flex items-center justify-center px-4 relative">
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
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Account Created Successfully
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,50%)] to-[hsl(217,90%,65%)]">
              Storm POS
            </span>
          </h1>
          {user && (
            <p className="text-xl text-gray-300 mb-2">
              {user.firstName}, your 7-day free trial is now active!
            </p>
          )}
          <p className="text-gray-400 max-w-md mx-auto">
            Everything is set up and ready to go. Start selling immediately with full access to all features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center hover:border-[hsl(217,90%,40%)]/30 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Instant Setup</h3>
            <p className="text-gray-400 text-xs">Ready to sell in seconds</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center hover:border-[hsl(217,90%,40%)]/30 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">7 Days Free</h3>
            <p className="text-gray-400 text-xs">No charges until day 8</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center hover:border-[hsl(217,90%,40%)]/30 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,45%)] to-[hsl(217,90%,35%)] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Full Access</h3>
            <p className="text-gray-400 text-xs">All features unlocked</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleGoToPOS}
            size="lg"
            className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] text-white font-bold px-10 py-7 text-lg shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all rounded-xl group"
          >
            Take Me to the POS
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="mt-4 text-gray-500 text-sm">Your trial started today, enjoy full access for 7 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 text-gray-500 text-xs">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              Bank-Grade Security
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              99.9% Uptime
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              24/7 Support
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
