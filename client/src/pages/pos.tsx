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
              <p className="text-xl mb-8 text-blue-100 font-medium">Storm POS is the always-online solution for South African businesses</p>
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