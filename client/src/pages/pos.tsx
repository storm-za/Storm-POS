import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Smartphone, Cloud, TrendingUp, Users, Shield, Zap } from "lucide-react";
import Footer from "@/components/footer";

export default function POS() {
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
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 hero-gradient text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              {/* Floating Badge */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Live • Always Online
              </motion.div>

              <h1 className="text-4xl md:text-7xl font-extrabold mb-8 leading-tight bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                Point of Sale That Goes 
                <span className="block text-white drop-shadow-lg">Wherever You Do</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-blue-100/90 font-medium leading-relaxed max-w-xl">
                Storm POS is the <span className="text-cyan-300 font-semibold">always-online solution</span> for South African businesses
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 30px 5px rgba(255, 255, 255, 0.5)",
                      "0 0 50px 10px rgba(255, 255, 255, 0.8)",
                      "0 0 30px 5px rgba(255, 255, 255, 0.5)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative rounded-lg"
                >
                  <Button 
                    asChild
                    size="lg"
                    className="group relative bg-white text-[hsl(217,90%,40%)] hover:bg-gray-50 transform hover:scale-110 transition-all duration-300 shadow-2xl border-0 px-10 py-6 text-xl font-bold"
                    data-testid="button-start-free-trial"
                  >
                    <Link href="/pos/signup">
                      Start 7-Day Free Trial
                      <motion.span 
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                        initial={{ x: 0 }}
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                
                <Button 
                  asChild
                  size="lg"
                  className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl border-0 px-8 py-4 text-lg font-semibold"
                  data-testid="button-login-pos"
                >
                  <Link href="/pos/login">
                    Log In to POS
                    <motion.span 
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                      initial={{ x: 0 }}
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center text-blue-200 text-sm"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No setup fees • Start immediately
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:text-right text-center relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative">
                {/* Glassmorphism Container */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <svg className="w-full h-auto max-w-lg mx-auto" viewBox="0 0 500 400" fill="none">
                    {/* Enhanced Mobile Phone */}
                    <defs>
                      <linearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1f2937"/>
                        <stop offset="100%" stopColor="#374151"/>
                      </linearGradient>
                      <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6"/>
                        <stop offset="100%" stopColor="#1d4ed8"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Phone Shadow */}
                    <ellipse cx="205" cy="340" rx="50" ry="8" fill="#000" opacity="0.2"/>
                    
                    {/* Main Phone */}
                    <rect x="175" y="60" width="120" height="220" rx="20" fill="url(#phoneGradient)" stroke="#60a5fa" strokeWidth="3"/>
                    <rect x="185" y="85" width="100" height="150" rx="8" fill="url(#screenGradient)"/>
                    
                    {/* Phone Details */}
                    <rect x="190" y="95" width="90" height="60" rx="4" fill="#1e40af" opacity="0.8"/>
                    <rect x="195" y="100" width="35" height="8" rx="2" fill="#60a5fa"/>
                    <rect x="195" y="112" width="25" height="6" rx="1" fill="#93c5fd"/>
                    <rect x="195" y="122" width="45" height="6" rx="1" fill="#dbeafe"/>
                    
                    {/* Modern POS Terminal */}
                    <rect x="90" y="150" width="100" height="80" rx="12" fill="#f8fafc" stroke="#3b82f6" strokeWidth="3"/>
                    <rect x="100" y="165" width="80" height="30" rx="6" fill="url(#screenGradient)"/>
                    <circle cx="110" cy="215" r="8" fill="#10b981"/>
                    <circle cx="130" cy="215" r="8" fill="#f59e0b"/>
                    <circle cx="150" cy="215" r="8" fill="#ef4444"/>
                    <circle cx="170" cy="215" r="8" fill="#8b5cf6"/>
                    
                    {/* Enhanced Credit Card */}
                    <rect x="310" y="170" width="80" height="50" rx="8" fill="#1f2937" stroke="#fbbf24" strokeWidth="2"/>
                    <rect x="320" y="185" width="50" height="8" rx="3" fill="#fbbf24"/>
                    <rect x="320" y="200" width="30" height="5" rx="2" fill="#d1d5db"/>
                    <circle cx="365" cy="205" r="12" fill="#fbbf24" opacity="0.3"/>
                    <circle cx="365" cy="205" r="8" fill="#fbbf24" opacity="0.6"/>
                    
                    {/* Floating Data Particles */}
                    <motion.circle 
                      cx="120" cy="100" r="18" fill="#10b981" opacity="0.8"
                      animate={{ y: [0, -15, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    />
                    <motion.circle 
                      cx="380" cy="120" r="15" fill="#f59e0b" opacity="0.7"
                      animate={{ y: [0, 12, 0], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                    />
                    <motion.circle 
                      cx="140" cy="80" r="12" fill="#8b5cf6" opacity="0.6"
                      animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                    />
                    <motion.circle 
                      cx="350" cy="280" r="20" fill="#06b6d4" opacity="0.5"
                      animate={{ y: [0, 10, 0], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
                    />
                    
                    {/* Connection Lines */}
                    <motion.path 
                      d="M195 180 L310 190" 
                      stroke="#60a5fa" 
                      strokeWidth="2" 
                      strokeDasharray="5,5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.path 
                      d="M150 190 L175 200" 
                      stroke="#10b981" 
                      strokeWidth="2" 
                      strokeDasharray="3,3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                    />
                  </svg>
                </div>
                
                {/* Floating Stats */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -top-4 -left-4 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-xl"
                >
                  99.9% Uptime
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.5 }}
                  className="absolute -bottom-4 -right-4 bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-xl"
                >
                  Real-time Sync
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for Modern Retailers</h2>
            <p className="text-xl text-gray-600">Everything you need to run your business, anywhere in South Africa</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Device Design</h3>
              <p className="text-gray-600">Works perfectly on smartphones, tablets, and desktops. Comfortable on any device.</p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Always Online</h3>
              <p className="text-gray-600">Cloud-based system that syncs instantly. Never lose a sale.</p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Reports</h3>
              <p className="text-gray-600">Real-time analytics and insights to grow your business.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7-Day Free Trial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Try Storm POS Risk-Free for 7 Days
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Start selling today with full access to every feature. No credit card required.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Full 7 Days Free</h3>
              <p className="text-blue-100 leading-relaxed">
                Complete access to all features with zero charges for your entire first week
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">No Credit Card Needed</h3>
              <p className="text-blue-100 leading-relaxed">
                Sign up instantly without any payment information. Start selling right away
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[hsl(217,90%,40%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">R0.00 Usage Fees</h3>
              <p className="text-blue-100 leading-relaxed">
                Make as many sales as you want during your trial - no 0.5% fee until day 8
              </p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button 
              asChild
              size="lg"
              className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 font-bold px-12 py-6 text-lg shadow-2xl"
              data-testid="button-trial-cta"
            >
              <Link href="/pos/signup">Start Your Free Trial Now →</Link>
            </Button>
            <p className="mt-6 text-blue-100 text-sm">
              After 7 days, our simple 0.5% per sale pricing starts automatically. No surprises, no contracts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Usage-Based Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We Only Make Money<br />
              <span className="text-[hsl(217,90%,40%)]">When You Do</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              No upfront costs, no monthly fees, no hidden charges. Pay only when you succeed with our revolutionary usage-based model.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-12 items-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Left Side - Main Value Prop */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Only 0.5% Per Sale</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  That's just 50 cents for every R100 you sell. No matter how small your business, 
                  you'll never pay more than what's fair for your success.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-2xl font-bold text-[hsl(217,90%,40%)] mb-2">R0</div>
                  <div className="text-sm text-gray-600">Setup Fee</div>
                </div>
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="text-2xl font-bold text-[hsl(217,90%,40%)] mb-2">R0</div>
                  <div className="text-sm text-gray-600">Monthly Fee</div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Benefits */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Everything Included</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Unlimited Everything</div>
                      <div className="text-gray-600 text-sm">Users, products, customers, sales - no limits</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Advanced Analytics</div>
                      <div className="text-gray-600 text-sm">Real-time insights and comprehensive reporting</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">24/7 Support</div>
                      <div className="text-gray-600 text-sm">Always here when you need us</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Automatic Updates</div>
                      <div className="text-gray-600 text-sm">New features delivered continuously</div>
                    </div>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </motion.div>

          {/* Usage Examples */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl p-8 text-white"
          >
            <h4 className="text-2xl font-bold text-center mb-8">See How Affordable It Really Is</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold mb-2">R1,000</div>
                <div className="text-blue-100 mb-2">Daily Sales</div>
                <div className="text-sm">You pay only <strong>R5/day</strong></div>
              </div>
              <div className="text-center p-6 bg-white/20 rounded-xl backdrop-blur-sm transform scale-105">
                <div className="text-3xl font-bold mb-2">R5,000</div>
                <div className="text-blue-100 mb-2">Daily Sales</div>
                <div className="text-sm">You pay only <strong>R25/day</strong></div>
              </div>
              <div className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold mb-2">R10,000</div>
                <div className="text-blue-100 mb-2">Daily Sales</div>
                <div className="text-sm">You pay only <strong>R50/day</strong></div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button 
                asChild
                size="lg"
                className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 font-semibold px-8"
              >
                <Link href="/pos/login">Start Selling Today - Free Setup</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 hero-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Modernize Your Sales?</h2>
            <p className="text-xl text-blue-100 mb-8">Join hundreds of South African businesses using Storm POS</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transition-all duration-200"
              >
                <Link href="/pos/login">Start Selling Today</Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-200 font-semibold"
              >
                <Link href="/">Back to Storm</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}