import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, ScanBarcode, TrendingUp, Users, Award, Shield, CheckCircle, Star, ChevronDown, ChevronUp, Mail, Sparkles, X, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM (10)_1759748743787.png";
import { updatePageSEO } from "@/lib/seo";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingInterestOpen, setPricingInterestOpen] = useState(false);
  const [pricingEmail, setPricingEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const { toast } = useToast();

  const pricingInterestMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/pricing-interest", { email });
      return response.json();
    },
    onSuccess: () => {
      setEmailSubmitted(true);
      toast({
        title: "Success!",
        description: "You'll be notified when Pricing Intelligence launches.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePricingInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pricingEmail && pricingEmail.includes("@")) {
      pricingInterestMutation.mutate(pricingEmail);
    }
  };

  useEffect(() => {
    updatePageSEO({
      title: 'Storm - Smart Software. Built for Growth.',
      description: 'Professional websites and software solutions for South African businesses. Monthly packages starting from R799. Get a stunning website or powerful POS system today.',
      canonical: 'https://stormsoftware.co.za/'
    });

    const faqSchema = document.createElement('script');
    faqSchema.type = 'application/ld+json';
    faqSchema.id = 'home-faq-schema';
    faqSchema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does Storm POS cost?",
          "acceptedAnswer": { "@type": "Answer", "text": "Storm POS has no monthly fees or setup costs. You only pay 0.5% per sale plus R0.50 per invoice generated. You only pay when you make money." }
        },
        {
          "@type": "Question",
          "name": "Does Storm POS work in Afrikaans?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, Storm POS has full Afrikaans language support. You can switch between English and Afrikaans at any time." }
        },
        {
          "@type": "Question",
          "name": "Is there a free trial for Storm POS?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes, Storm POS offers a 7-day free trial with full access to all features. No credit card required to get started." }
        },
        {
          "@type": "Question",
          "name": "How much does a website cost in South Africa?",
          "acceptedAnswer": { "@type": "Answer", "text": "Storm offers professional website packages starting from R799 per month. This includes custom design, mobile optimization, hosting, and SEO setup - with no large upfront cost." }
        },
        {
          "@type": "Question",
          "name": "Does Storm Software serve South African businesses only?",
          "acceptedAnswer": { "@type": "Answer", "text": "Storm Software is based in South Africa and is specifically built for SA businesses, with Rand pricing, Afrikaans support, and an understanding of local market conditions like load shedding." }
        }
      ]
    });
    document.head.appendChild(faqSchema);

    const breadcrumbSchema = document.createElement('script');
    breadcrumbSchema.type = 'application/ld+json';
    breadcrumbSchema.id = 'home-breadcrumb-schema';
    breadcrumbSchema.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stormsoftware.co.za/" }
      ]
    });
    document.head.appendChild(breadcrumbSchema);

    return () => {
      document.getElementById('home-faq-schema')?.remove();
      document.getElementById('home-breadcrumb-schema')?.remove();
    };
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      {/* Hero Section - Enterprise White Design */}
      <section className="relative pt-8 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-blue-50 overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          {/* Animated gradient mesh - blue only, very low opacity */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(217,90%,60%)]/8 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[hsl(217,90%,60%)]/5 via-transparent to-transparent" />
          
          {/* Animated grid pattern - blue toned, very low opacity */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
          
          {/* Glowing orbs - blue, low opacity */}
          <motion.div 
            className="absolute top-20 left-1/4 w-64 h-64 bg-[hsl(217,90%,60%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-[hsl(217,90%,60%)]/8 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Floating particles - blue */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[hsl(217,90%,50%)]/30 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -40, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[hsl(217,90%,60%)]/10 blur-2xl rounded-full scale-150" />
                <img src={stormLogo} alt="Storm" className="relative h-36 w-auto drop-shadow-lg" />
              </div>
            </motion.div>
            
            {/* Enterprise badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center px-5 py-2 mb-8 bg-[hsl(217,90%,50%)]/10 backdrop-blur-xl rounded-full border border-[hsl(217,90%,50%)]/20 shadow-lg"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-[hsl(217,90%,35%)]">Enterprise Software Solutions</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6"
              variants={fadeInUp}
            >
              <span className="bg-gradient-to-r from-[hsl(217,90%,40%)] via-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] bg-clip-text text-transparent">Smart Software.</span>
              <br />
              <span className="text-gray-900">Built for Growth.</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              From stunning websites to intelligent business automation, <span className="text-gray-900 font-medium">we've got you covered.</span>
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] text-white hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-blue-500/30 px-8 py-6 text-lg font-semibold"
                onClick={() => {
                  const solutionsSection = document.querySelector('#solutions-section');
                  if (solutionsSection) {
                    solutionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Explore Our Solutions
                <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline"
                className="border-2 border-[hsl(217,90%,50%)]/40 text-[hsl(217,90%,40%)] bg-white hover:bg-[hsl(217,90%,50%)]/10 hover:border-[hsl(217,90%,50%)]/60 transition-all duration-300 px-8 py-6 text-lg font-semibold"
              >
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                <span>South African Based</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats Bar */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">500+</div>
              <div className="text-sm text-gray-500 font-medium">SA Businesses</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">R0</div>
              <div className="text-sm text-gray-500 font-medium">Setup Fee</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">7-Day</div>
              <div className="text-sm text-gray-500 font-medium">Free Trial</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">4.9/5</div>
              <div className="text-sm text-gray-500 font-medium">Rating</div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Solutions Section - Enterprise Design */}
      <section id="solutions-section" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 overflow-hidden">
        {/* High-Tech Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Gradient Orbs */}
          <motion.div 
            className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-[hsl(217,90%,60%)]/20 to-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-cyan-400/15 to-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          {/* Floating Tech Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[hsl(217,90%,40%)]/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Pulsing Rings */}
          <motion.div
            className="absolute top-1/2 left-1/4 w-64 h-64 border border-[hsl(217,90%,40%)]/10 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-48 h-48 border border-[hsl(217,90%,40%)]/10 rounded-full"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: 1,
              ease: "easeOut"
            }}
          />
          
          {/* Scanning Lines Effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(217,90%,40%)]/30 to-transparent"
            animate={{
              top: ['0%', '100%'],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full text-sm font-medium mb-6 border border-white/10"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-2 animate-pulse shadow-lg shadow-blue-500/50"></span>
              <span className="text-gray-400">Our Premium Solutions</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Everything Your Business </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">Needs to Thrive</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From stunning websites to intelligent business tools, we deliver <span className="text-white font-medium">solutions that scale</span> with your success
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Web Development Card - Enterprise Design */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/40 transition-all duration-500 h-full hover:-translate-y-2 shadow-2xl">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,50%)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(217,90%,50%)]/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-[hsl(217,90%,50%)] to-[hsl(217,90%,40%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
                    <Code className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[hsl(217,90%,60%)] transition-colors duration-300">Web Development</h3>
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed">Get a professional website that ranks on Google and converts visitors into paying customers, from <span className="text-white font-medium">R799/month.</span></p>
                  <Button asChild className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] text-white hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold">
                    <Link href="/web-development">
                      Start Your Project
                      <motion.span className="ml-2" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* POS Software Card - Enterprise Design */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/40 transition-all duration-500 h-full hover:-translate-y-2 shadow-2xl">
                {/* Available Now badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[hsl(217,90%,50%)] to-[hsl(217,90%,60%)] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30 z-10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Available Now
                  </span>
                </div>
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,50%)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(217,90%,50%)]/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-[hsl(217,90%,55%)] to-[hsl(217,90%,45%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
                    <ScanBarcode className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[hsl(217,90%,60%)] transition-colors duration-300">Storm POS</h3>
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed">Accept payments, track inventory, and send invoices from any device. No monthly fee, <span className="text-white font-medium">you only pay when you make money.</span></p>
                  <Button 
                    asChild 
                    className="bg-gradient-to-r from-[hsl(217,90%,50%)] to-[hsl(217,90%,45%)] text-white hover:from-[hsl(217,90%,55%)] hover:to-[hsl(217,90%,50%)] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold"
                  >
                    <Link href="/pos">
                      Explore POS System
                      <motion.span className="ml-2" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Pricing Tracker Card - Enterprise Design */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-amber-500/40 transition-all duration-500 h-full hover:-translate-y-2 shadow-2xl">
                {/* Coming Soon badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/30 z-10">
                  Coming Soon
                </div>
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:shadow-amber-500/50 transition-all duration-300">
                    <TrendingUp className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">Pricing Intelligence</h3>
                  <p className="text-gray-400 mb-6 flex-grow leading-relaxed">Know what your competitors charge before your customers do. Real-time <span className="text-white font-medium">market intelligence</span> to help you stay ahead and win more business.</p>
                  <div className="mt-auto">
                    <button 
                      onClick={() => setPricingInterestOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-amber-400 transition-all duration-300 cursor-pointer"
                    >
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                      Notify me when available
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us Section - Enterprise Design */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[hsl(217,90%,30%)]/10 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-gray-400">Who We Are</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">About </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">Storm</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Empowering South African businesses with cutting-edge technology that drives <span className="text-white font-medium">real growth and success.</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center px-3 py-1 bg-[hsl(217,90%,40%)]/20 rounded-full">
                <span className="text-xs font-semibold text-[hsl(217,90%,60%)] uppercase tracking-wider">Our Mission</span>
              </div>
              <h3 className="text-3xl font-bold text-white">Building the Future of SA Business</h3>
              <p className="text-lg text-gray-400 leading-relaxed">
                Storm was founded with a simple yet powerful mission: to democratize access to premium business technology. We believe every South African business, regardless of size, deserves <span className="text-white">enterprise-level software solutions.</span>
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                From our headquarters in South Africa, we've built a team of passionate developers, designers, and business strategists who understand the unique challenges local businesses face. <span className="text-white">Our solutions aren't just software. They're growth accelerators.</span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent mb-2">500+</div>
                  <div className="text-sm text-gray-400 font-medium">Happy Clients</div>
                </div>
                <div className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-[hsl(217,90%,55%)] to-[hsl(217,90%,45%)] bg-clip-text text-transparent mb-2">99.9%</div>
                  <div className="text-sm text-gray-400 font-medium">Uptime</div>
                </div>
                <div className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent mb-2">24/7</div>
                  <div className="text-sm text-gray-400 font-medium">Support</div>
                </div>
                <div className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">5+</div>
                  <div className="text-sm text-gray-400 font-medium">Years Experience</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <div className="group h-full p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,50%)] to-[hsl(217,90%,40%)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Users className="text-white h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Expert Team</h4>
                <p className="text-gray-400">Our skilled developers and designers bring years of experience to every project</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="group h-full p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,55%)] to-[hsl(217,90%,45%)] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Award className="text-white h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Quality First</h4>
                <p className="text-gray-400">We never compromise on quality, delivering solutions that exceed expectations</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="group h-full p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">Trusted & Secure</h4>
                <p className="text-gray-400">Enterprise-grade security and reliability you can count on</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section - Enterprise Design */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[hsl(217,90%,30%)]/15 via-transparent to-transparent" />
          <motion.div 
            className="absolute -top-40 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
              <span className="text-sm font-medium text-gray-400">Client Testimonials</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">What Our </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Real feedback from South African businesses who've <span className="text-white font-medium">transformed their operations</span> with Storm
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Card className="group h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed italic text-lg">
                  "Storm built our website in under 2 weeks and it immediately started ranking on Google. <span className="text-white font-medium">Our leads tripled</span> within the first month. Best decision we made."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,50%)] to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold text-lg">NM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Nandi Mokoena</div>
                    <div className="text-sm text-gray-500">Salon Owner, Johannesburg</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="group h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed italic text-lg">
                  "Storm POS replaced our old till system at zero setup cost. No monthly fees, works on my phone and my staff's tablets. <span className="text-white font-medium">It has saved us thousands</span> every year."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/25">
                    <span className="text-white font-bold text-lg">TV</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Thabo Van Wyk</div>
                    <div className="text-sm text-gray-500">Retail Store Owner, Pretoria</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="group h-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed italic text-lg">
                  "I was sceptical at first, but Storm delivered a beautiful website on time and within budget. <span className="text-white font-medium">We are now on page one of Google</span> for our main services."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-purple-500/25">
                    <span className="text-white font-bold text-lg">LD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Liezel Du Plessis</div>
                    <div className="text-sm text-gray-500">Bookkeeping Practice, Cape Town</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Enterprise Design */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[hsl(217,90%,25%)]/20 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-3 animate-pulse" />
              <span className="text-sm font-medium text-gray-400">Got Questions?</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Frequently Asked </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our <span className="text-white font-medium">services and solutions</span>
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {[
              {
                question: "How quickly can you deliver a website?",
                answer: "Most websites are completed within 2-4 weeks, depending on complexity. We provide regular updates throughout the process and can accommodate urgent timelines when needed."
              },
              {
                question: "Is Storm POS suitable for small businesses?",
                answer: "Absolutely! Storm POS is designed for businesses of all sizes. With our 0.5% per sale model, you only pay when you make money, making it perfect for small retailers and growing businesses."
              },
              {
                question: "Do you provide ongoing support?",
                answer: "Yes, we offer 24/7 support for all our solutions. Whether you need technical assistance, training, or have questions about features, our South African support team is always ready to help."
              },
              {
                question: "What makes Storm different from competitors?",
                answer: "We're proudly South African, understanding local business needs. Our usage-based pricing, all device design, and commitment to quality set us apart. Plus, we provide personal service with real people, not chatbots."
              },
              {
                question: "How secure are your systems?",
                answer: "Security is our priority. We use enterprise-grade encryption, secure cloud infrastructure, and follow international best practices. Your data is protected with bank-level security measures."
              }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 overflow-hidden">
                  <button
                    className="w-full p-6 text-left hover:bg-white/5 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white pr-8">{faq.question}</h3>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${openFaq === index ? 'bg-[hsl(217,90%,40%)]' : 'bg-white/10'}`}>
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action - Enterprise Design */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(217,90%,35%)] via-[hsl(217,90%,40%)] to-[hsl(217,90%,45%)] text-white overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
          <motion.div 
            className="absolute -top-40 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-5 py-2 mb-8 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
            >
              <span className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse shadow-lg shadow-white/50" />
              <span className="text-sm font-medium text-white/90">Start Your Journey Today</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Transform<br />Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of South African businesses who've <span className="text-white font-semibold">accelerated their growth</span> with Storm's innovative solutions
            </p>
            <p className="text-sm text-blue-200 mb-6 font-medium">No setup fees. No lock-in contracts. Cancel anytime.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-black/20 px-10 py-6 text-lg font-bold rounded-xl"
              >
                <Link href="/web-development">
                  Get Your Website
                  <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="group border-2 border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-300 font-bold px-10 py-6 text-lg rounded-xl"
              >
                <Link href="/pos">
                  Try Storm POS
                  <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>→</motion.span>
                </Link>
              </Button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <CheckCircle className="w-4 h-4 text-white" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Start Immediately</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Cancel Anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Pricing Intelligence Interest Dialog */}
      <Dialog open={pricingInterestOpen} onOpenChange={(open) => {
        setPricingInterestOpen(open);
        if (!open) {
          setPricingEmail("");
          setEmailSubmitted(false);
        }
      }}>
        <DialogContent className="sm:max-w-[480px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl p-0 overflow-hidden">
          {/* Premium Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative p-8">
            {!emailSubmitted ? (
              <>
                <DialogHeader className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
                    <TrendingUp className="text-white h-8 w-8" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-white mb-2">
                    Pricing Intelligence
                  </DialogTitle>
                  <DialogDescription className="text-gray-400 text-base leading-relaxed">
                    Be the first to know when our advanced pricing intelligence platform launches. Get early access to <span className="text-amber-400 font-medium">market analysis</span> and <span className="text-amber-400 font-medium">competitor tracking</span> tools.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handlePricingInterestSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={pricingEmail}
                      onChange={(e) => setPricingEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={pricingInterestMutation.isPending || !pricingEmail.includes("@")}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {pricingInterestMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notify Me When Available
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-4">
                  We'll only email you about this product. No spam.
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="text-white h-10 w-10" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                <p className="text-gray-400 mb-6">
                  We'll notify you at <span className="text-white font-medium">{pricingEmail}</span> when Pricing Intelligence launches.
                </p>
                <Button
                  onClick={() => {
                    setPricingInterestOpen(false);
                    setPricingEmail("");
                    setEmailSubmitted(false);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl px-6 py-3"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
