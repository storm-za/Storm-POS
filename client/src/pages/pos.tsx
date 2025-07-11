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
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 hero-gradient text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Point of Sale That Goes Wherever You Do
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Storm POS is your lightweight, always-online, mobile-first solution for South African SMEs.
              </p>
              <Button 
                asChild
                size="lg"
                className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Link href="/pos/login">Log In to POS</Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="lg:text-right text-center relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative">
                <svg className="w-full h-auto max-w-md mx-auto" viewBox="0 0 400 300" fill="none">
                  {/* Mobile Phone */}
                  <rect x="150" y="50" width="100" height="180" rx="15" fill="#1f2937" stroke="#3b82f6" strokeWidth="2"/>
                  <rect x="160" y="70" width="80" height="120" rx="5" fill="#3b82f6"/>
                  <circle cx="200" cy="210" r="8" fill="#6b7280"/>
                  
                  {/* POS Terminal */}
                  <rect x="80" y="120" width="80" height="60" rx="8" fill="#f3f4f6" stroke="#3b82f6" strokeWidth="2"/>
                  <rect x="90" y="130" width="60" height="20" rx="3" fill="#3b82f6"/>
                  <rect x="90" y="155" width="20" height="8" rx="2" fill="#10b981"/>
                  <rect x="115" y="155" width="20" height="8" rx="2" fill="#f59e0b"/>
                  <rect x="140" y="155" width="10" height="8" rx="2" fill="#ef4444"/>
                  
                  {/* Credit Card */}
                  <rect x="260" y="140" width="60" height="40" rx="6" fill="#1f2937"/>
                  <rect x="270" y="150" width="40" height="6" rx="2" fill="#fbbf24"/>
                  <rect x="270" y="165" width="25" height="4" rx="1" fill="#9ca3af"/>
                  
                  {/* Floating Elements */}
                  <motion.circle 
                    cx="100" cy="80" r="15" fill="#10b981" 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx="320" cy="100" r="12" fill="#f59e0b"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  />
                </svg>
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile-First Design</h3>
              <p className="text-gray-600">Works perfectly on smartphones, tablets, and desktops. Sell anywhere.</p>
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

      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your business size</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Basic Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R900<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      1 user account
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      100 products max
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Basic reporting
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Mobile POS
                    </li>
                  </ul>
                  <Button 
                    asChild
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]"
                  >
                    <Link href="/pos/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Growth Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl text-white transform scale-105 relative hero-gradient">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">Growth</h3>
                  <div className="text-4xl font-bold mb-4">
                    R1500<span className="text-lg text-blue-200">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-blue-100 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      3 user accounts
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Unlimited products
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Advanced reporting
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Customer management
                    </li>
                  </ul>
                  <Button 
                    asChild
                    className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100"
                  >
                    <Link href="/pos/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Pro Plan */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R6500<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Unlimited users
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Premium reporting
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Expense tracking
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    asChild
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]"
                  >
                    <Link href="/pos/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
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