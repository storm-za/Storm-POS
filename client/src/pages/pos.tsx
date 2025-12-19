import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, Smartphone, Cloud, TrendingUp, Users, Shield, Zap, ArrowLeft,
  FileSpreadsheet, FileText, Receipt, BarChart3, Package, CreditCard, 
  Globe, RefreshCw, Calculator, PieChart, UserCheck, Lock, Languages,
  Wallet, BookOpen, MessageSquare, Share2, ArrowRight
} from "lucide-react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1761856744843.png";
import deviceMockup from "@assets/STORM__16_-removebg-preview_1761854439596.png";
import laptopMockup from "@assets/STORM__17_-removebg-preview_1761855220519.png";
import mobileMockup from "@assets/STORM__18_-removebg-preview_1761855233465.png";
import laptopScene from "@assets/STORM (500 x 250 px) (1)_1761857579860.png";
import mobileScene from "@assets/STORM (19)_1761857582315.png";
import { updatePageSEO } from "@/lib/seo";

export default function POS() {
  useEffect(() => {
    updatePageSEO({
      title: 'Storm POS - Cloud Point of Sale System | 7 Days Free, Pay Only 0.5% Per Sale',
      description: 'The smartest POS system for South African retailers. No monthly fees, no setup costs. Just 0.5% per sale. Try free for 7 days. Always online, works on any device.',
      canonical: window.location.origin + '/pos'
    });
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
      {/* Return to Home Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 left-6 z-50"
      >
        <Button
          asChild
          variant="ghost"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-[hsl(217,90%,40%)]"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>
      </motion.div>
      {/* Hero Section - High-Tech Design */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <motion.div 
            className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(217,90%,40%)]/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="space-y-8 z-10"
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex justify-center lg:justify-start"
              >
                <img src={stormLogo} alt="Storm" className="h-48 w-auto mb-6" />
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[hsl(217,90%,40%)]/20">
                  Next-Gen Cloud POS
                </span>
              </motion.div>

              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-gray-900">
                  Point of Sale<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] via-[hsl(217,90%,45%)] to-[hsl(217,90%,50%)]">
                    That Goes<br />Everywhere
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                  The always-online, cloud-powered solution engineered for modern South African businesses. 
                  Process sales instantly from any device, anywhere.
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  asChild
                  size="lg"
                  className="group relative bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] transform hover:scale-105 transition-all duration-300 border-0 px-10 py-7 text-xl font-bold shadow-2xl shadow-blue-500/30"
                  data-testid="button-start-free-trial"
                >
                  <Link href="/pos/signup">
                    <Zap className="w-5 h-5 mr-2" />
                    Start 7-Day Free Trial
                    <motion.span 
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>
                
                <Button 
                  asChild
                  size="lg"
                  className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-50 border-2 border-[hsl(217,90%,40%)] hover:border-[hsl(217,90%,45%)] transform hover:scale-105 transition-all duration-300 px-8 py-7 text-lg font-semibold shadow-lg"
                  data-testid="button-login-pos"
                >
                  <Link href="/pos/login">
                    Log In to POS
                    <motion.span 
                      className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                    >
                      →
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">No Setup Fees</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">7-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">No Credit Card</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Side - Device Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              {/* Main Device Display */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/15 blur-3xl scale-110 rounded-full"></div>
                
                {/* Laptop */}
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="relative"
                >
                  <div className="relative bg-white/60 backdrop-blur-2xl rounded-3xl p-8 border border-[hsl(217,90%,40%)]/20 shadow-2xl">
                    <motion.img
                      src={laptopMockup}
                      alt="Storm POS Dashboard"
                      className="w-full h-auto relative z-10"
                      animate={{ 
                        y: [0, -8, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>

                {/* Floating Mobile Device */}
                <motion.div
                  initial={{ y: 50, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="absolute -bottom-12 -left-6 lg:-left-16 w-40 lg:w-48 z-20"
                >
                  <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-4 border border-[hsl(217,90%,40%)]/30 shadow-2xl">
                    <motion.img
                      src={mobileMockup}
                      alt="Storm POS Mobile"
                      className="w-full h-auto"
                      animate={{ 
                        y: [0, -12, 0],
                        rotate: [0, 2, 0]
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </motion.div>

                {/* Floating Stat Cards */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute top-4 right-2 lg:-top-8 lg:right-0 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white px-[1.125rem] py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-[0.75rem] lg:text-xs font-medium opacity-90">System Status</div>
                      <div className="text-sm lg:text-lg font-bold">99.9%</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute top-[calc(33.333%-20px)] lg:top-1/3 left-2 lg:-left-8 bg-white backdrop-blur-xl text-[hsl(217,90%,40%)] px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border border-[hsl(217,90%,40%)] lg:border-2 z-30"
                >
                  <div className="flex items-center gap-1.5 lg:gap-3">
                    <Cloud className="w-3 h-3 lg:w-6 lg:h-6" />
                    <div>
                      <div className="text-[0.5rem] lg:text-xs font-medium opacity-90">Infrastructure</div>
                      <div className="text-xs lg:text-lg font-bold">Cloud</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="absolute bottom-[calc(25%-20px)] lg:bottom-1/4 right-2 lg:-right-8 bg-white backdrop-blur-xl text-[hsl(217,90%,40%)] px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border border-green-500 lg:border-2 z-30"
                >
                  <div className="flex items-center gap-1.5 lg:gap-3">
                    <Shield className="w-3 h-3 lg:w-6 lg:h-6 text-green-500" />
                    <div>
                      <div className="text-[0.5rem] lg:text-xs font-medium opacity-90">Security</div>
                      <div className="text-xs lg:text-lg font-bold">Bank-Grade</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 text-center"
          >
            <div className="text-xs font-medium mb-2">Scroll to explore</div>
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full mx-auto flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* What is Storm POS Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Next-Generation Technology
              </span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What is <span className="text-[hsl(217,90%,40%)]">Storm POS</span>?
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
              Storm POS is a revolutionary cloud-based Point of Sale system engineered for the modern South African retailer. 
              Built on cutting-edge infrastructure, it delivers enterprise-grade performance with consumer-grade simplicity.
            </p>
          </motion.div>

          {/* Device Mockup with Features Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Device Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 blur-3xl rounded-full scale-110"></div>
                
                {/* Glass Container */}
                <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/60 shadow-2xl">
                  <motion.img 
                    src={deviceMockup} 
                    alt="Storm POS on Multiple Devices" 
                    className="w-full h-auto relative z-10"
                    initial={{ scale: 0.95 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -top-6 -right-6 bg-[hsl(217,90%,40%)] text-white px-6 py-3 rounded-2xl shadow-2xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs font-medium">Cloud-Based</div>
                  </div>
                </motion.div>

                {/* Floating Badge 2 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white text-[hsl(217,90%,40%)] px-6 py-3 rounded-2xl shadow-2xl border-2 border-[hsl(217,90%,40%)]"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-xs font-medium">Always Online</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Side - Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-8">
                {/* Feature 1 */}
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning-Fast Performance</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Process transactions in milliseconds with our optimized cloud architecture. 
                      No lag, no delays—just instant responsiveness across all devices.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise-Grade Security</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Bank-level encryption protects your data. Multi-tenant architecture ensures 
                      complete isolation between businesses with zero data crossover.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Universal Device Compatibility</h3>
                    <p className="text-gray-600 leading-relaxed">
                      One system, every screen. Seamlessly transition between smartphone, tablet, 
                      and desktop with automatic sync and responsive design.
                    </p>
                  </div>
                </motion.div>

                {/* Feature 4 */}
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Intelligence</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Live analytics, instant inventory updates, and synchronized data across your entire 
                      operation. Make informed decisions with up-to-the-second insights.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Tech Stack Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="pt-8 border-t border-gray-200"
              >
                <p className="text-sm text-gray-500 mb-3 font-medium">Powered by</p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-white border border-[hsl(217,90%,40%)]/30 rounded-lg text-sm font-medium text-gray-700">
                    PostgreSQL Cloud
                  </span>
                  <span className="px-4 py-2 bg-white border border-[hsl(217,90%,40%)]/30 rounded-lg text-sm font-medium text-gray-700">
                    Real-Time Sync
                  </span>
                  <span className="px-4 py-2 bg-white border border-[hsl(217,90%,40%)]/30 rounded-lg text-sm font-medium text-gray-700">
                    Advanced Encryption
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Multi-Device Section - Unified Design */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[hsl(217,90%,50%)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                One System, Every Device
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Work From <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Anywhere</span>,<br />
              Always Online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your business runs 24/7 in the cloud. Switch seamlessly between desktop, tablet, and smartphone—all your data syncs instantly in real-time.
            </p>
          </motion.div>

          {/* Unified Image Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mb-16"
          >
            {/* Main Container */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Desktop Image */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <img 
                    src={laptopScene} 
                    alt="Storm POS on Desktop" 
                    className="w-full h-auto rounded-xl shadow-xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
                    Desktop
                  </div>
                </motion.div>

                {/* Right: Mobile Image */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative"
                >
                  <img 
                    src={mobileScene} 
                    alt="Storm POS on Mobile" 
                    className="w-full h-auto rounded-xl shadow-xl"
                  />
                  <div className="absolute -bottom-4 -left-4 bg-white text-[hsl(217,90%,40%)] border-2 border-[hsl(217,90%,40%)] px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
                    Mobile
                  </div>
                </motion.div>
              </div>

              {/* Connecting Line Visual */}
              <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-0.5 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] opacity-30"></div>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeInUp}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Cloud className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Always Online</h3>
              <p className="text-gray-600 leading-relaxed">
                Cloud-based infrastructure means your POS system is accessible 24/7 from any device with internet. Never offline, never out of reach.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Universal Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Make a sale on your phone, check reports on your laptop, manage inventory on your tablet. Everything syncs instantly across all devices.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Optimized for speed on every device. Process transactions in milliseconds whether you're on a smartphone or desktop computer.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Section 1: Complete Business Suite */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(217,90%,50%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Everything You Need
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Business Suite</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every tool you need to run your business, all in one powerful platform. No add-ons, no extra costs.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 - Real-Time Sales */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Sales Processing</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Accept Cash, Card, and EFT payments instantly. Every sale syncs across all your devices in real-time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] text-sm rounded-full font-medium">Cash</span>
                    <span className="px-3 py-1 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] text-sm rounded-full font-medium">Card</span>
                    <span className="px-3 py-1 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] text-sm rounded-full font-medium">EFT</span>
                    <span className="px-3 py-1 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] text-sm rounded-full font-medium">Split Payments</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 - Inventory */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Inventory</h3>
              <p className="text-gray-600 leading-relaxed">
                Track stock levels automatically. Get low-stock alerts and never run out of bestsellers.
              </p>
            </motion.div>

            {/* Feature 3 - Customer Directory */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Directory</h3>
              <p className="text-gray-600 leading-relaxed">
                Retail & trade customers with notes, purchase history, and contact details.
              </p>
            </motion.div>

            {/* Feature 4 - Invoices */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Invoices & Quotes</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate professional PDFs with your logo. Send via WhatsApp instantly.
              </p>
            </motion.div>

            {/* Feature 5 - Open Accounts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Open Accounts</h3>
              <p className="text-gray-600 leading-relaxed">
                Tab system for restaurants, bars, and customer credit. Settle anytime.
              </p>
            </motion.div>

            {/* Feature 6 - Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-2 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl p-8 shadow-xl text-white group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Detailed Analytics</h3>
                  <p className="text-blue-100 leading-relaxed mb-4">
                    Beautiful charts, comprehensive reports, and profit tracking. Know exactly how your business is performing at any moment.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium">Revenue Tracking</span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium">Profit Reports</span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full font-medium">Trend Charts</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 7 - Staff Management */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Staff Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Role-based access control. Track who made each sale with accountability.
              </p>
            </motion.div>

            {/* Feature 8 - Receipts */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Receipts</h3>
              <p className="text-gray-600 leading-relaxed">
                Add your logo, business info, and custom messages. Professional from day one.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Section 2: Excel & Accounting Power */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/3 -left-32 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-1/3 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Seamless Integrations
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Excel & Accounting <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Power</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Your data flows seamlessly between Storm POS and your existing tools. Import, export, and sync with ease.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Excel Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileSpreadsheet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Excel Import/Export</h3>
                  <p className="text-gray-500">Spreadsheet Power</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Import products from spreadsheets</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Import customer lists in bulk</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Export sales data for accounting</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">Backup your entire database</span>
                </li>
              </ul>
            </motion.div>

            {/* XERO Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl flex items-center justify-center shadow-lg">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">XERO Integration</h3>
                  <p className="text-gray-500">Accounting Sync</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[hsl(217,90%,40%)]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>
                  <span className="text-gray-700">Sync customers automatically</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[hsl(217,90%,40%)]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>
                  <span className="text-gray-700">Push products to XERO</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[hsl(217,90%,40%)]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>
                  <span className="text-gray-700">Export invoices seamlessly</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[hsl(217,90%,40%)]/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-[hsl(217,90%,40%)]" />
                  </div>
                  <span className="text-gray-700">Keep books always up to date</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Data Flow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-full px-8 py-4 shadow-lg">
              <FileSpreadsheet className="w-8 h-8 text-green-500" />
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 text-[hsl(217,90%,40%)]" />
              </motion.div>
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              >
                <ArrowRight className="w-6 h-6 text-[hsl(217,90%,40%)]" />
              </motion.div>
              <Calculator className="w-8 h-8 text-[hsl(217,90%,40%)]" />
            </div>
            <p className="mt-4 text-gray-500 font-medium">Seamless data flow in both directions</p>
          </motion.div>
        </div>
      </section>
      {/* Section 3: Professional Document Generation */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-[hsl(217,90%,50%)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6"
              >
                <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                  Professional Documents
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Stunning Invoices in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Seconds</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Create professional invoices and quotes that impress your customers. Your brand, your details, automatically formatted.
              </p>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Auto-Generated Numbers</h4>
                    <p className="text-gray-600">Sequential invoice and quote numbers, automatically assigned</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">PDF Export</h4>
                    <p className="text-gray-600">Professional PDFs with your logo and business details</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">WhatsApp Sharing</h4>
                    <p className="text-gray-600">Send invoices instantly via WhatsApp with one tap</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Status Tracking</h4>
                    <p className="text-gray-600">Draft → Sent → Paid → Cancelled. Always know where you stand.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Invoice Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/20 to-[hsl(217,90%,50%)]/20 blur-3xl rounded-full scale-110"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Invoice Header */}
                <div className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] px-8 py-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl font-bold mb-1">INVOICE</div>
                      <div className="text-blue-100 text-sm">#INV-2024-0042</div>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div className="text-sm text-blue-100">Your Business</div>
                    </div>
                  </div>
                </div>
                
                {/* Invoice Body */}
                <div className="p-8">
                  <div className="flex justify-between mb-8">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bill To</div>
                      <div className="font-semibold text-gray-900">Customer Name</div>
                      <div className="text-sm text-gray-500">customer@email.com</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</div>
                      <div className="text-gray-900">19 Dec 2024</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-b border-gray-100 py-4 mb-6">
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Product Item 1</span>
                      <span className="font-medium text-gray-900">R 450.00</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-600">Product Item 2</span>
                      <span className="font-medium text-gray-900">R 320.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium text-gray-900">R 150.00</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-[hsl(217,90%,40%)]">R 920.00</span>
                  </div>
                </div>

                {/* Status Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute top-20 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-12 mt-[33px] mb-[33px] ml-[25px] mr-[25px]"
                >
                  <span className="font-bold text-sm">PAID</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Section 4: Insights That Drive Growth */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-0 left-1/3 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 right-1/3 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Data-Driven Decisions
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Insights That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Drive Growth</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Know your business inside out. Real-time analytics and beautiful reports that help you make smarter decisions.
            </p>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 to-[hsl(217,90%,50%)]/10 blur-3xl rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-3xl p-8 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {/* Stat Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl p-6 text-white"
                >
                  <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                  <div className="text-3xl font-bold mb-1">R42,580</div>
                  <div className="text-blue-100 text-sm">Today's Sales</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <Wallet className="w-8 h-8 mb-3 text-green-500" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">R8,750</div>
                  <div className="text-gray-500 text-sm">Today's Profit</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <Receipt className="w-8 h-8 mb-3 text-[hsl(217,90%,40%)]" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">127</div>
                  <div className="text-gray-500 text-sm">Transactions</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6"
                >
                  <Users className="w-8 h-8 mb-3 text-purple-500" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">48</div>
                  <div className="text-gray-500 text-sm">New Customers</div>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Chart Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="md:col-span-2 bg-gray-50 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Revenue Trend</h4>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-[hsl(217,90%,40%)]/10 text-[hsl(217,90%,40%)] text-xs rounded-full">Daily</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Weekly</span>
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Monthly</span>
                    </div>
                  </div>
                  {/* Fake Chart */}
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-t-lg"
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Pie Chart Area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-50 rounded-2xl p-6"
                >
                  <h4 className="font-bold text-gray-900 mb-4">Payment Methods</h4>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(217,90%,40%)" strokeWidth="16" strokeDasharray="126 251" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(217,90%,50%)" strokeWidth="16" strokeDasharray="75 251" strokeDashoffset="-126" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray="50 251" strokeDashoffset="-201" />
                      </svg>
                      <PieChart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[hsl(217,90%,40%)] rounded-full"></div>
                      <span className="text-gray-600">Cash (50%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[hsl(217,90%,50%)] rounded-full"></div>
                      <span className="text-gray-600">Card (30%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">EFT (20%)</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Export Button */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-center"
              >
                <span className="inline-flex items-center gap-2 text-[hsl(217,90%,40%)] font-medium">
                  <FileText className="w-4 h-4" />
                  Export all reports to PDF
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Section 5: Built for Your Team */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-0 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-[hsl(217,90%,50%)]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Team Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(217,90%,40%)]/10 to-[hsl(217,90%,50%)]/10 blur-3xl rounded-full"></div>
              <div className="relative grid grid-cols-2 gap-6">
                {/* Manager Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="col-span-2 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl p-6 text-white shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Manager Access</div>
                      <div className="text-blue-100 text-sm">Full control over all features</div>
                    </div>
                    <div className="ml-auto">
                      <Lock className="w-5 h-5 text-white/60" />
                    </div>
                  </div>
                </motion.div>

                {/* Staff Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg"
                >
                  <div className="w-12 h-12 bg-[hsl(217,90%,40%)]/10 rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div className="font-bold text-gray-900">Staff</div>
                  <div className="text-gray-500 text-sm">Sales & basic access</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="font-bold text-gray-900">Tracked</div>
                  <div className="text-gray-500 text-sm">Every action logged</div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6"
              >
                <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                  Team Management
                </span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Your Team</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Empower your staff with the right tools while keeping sensitive areas secure. Full accountability for every transaction.
              </p>

              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Individual Staff Logins</div>
                    <div className="text-gray-500 text-sm">Each team member has their own account</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Role-Based Access</div>
                    <div className="text-gray-500 text-sm">Management vs Staff permission levels</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-[hsl(217,90%,40%)]/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sale Attribution</div>
                    <div className="text-gray-500 text-sm">Know who made each sale</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Void Tracking</div>
                    <div className="text-gray-500 text-sm">Every void requires a reason</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Section 6: Speaks Your Language */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background with SA Colors */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 left-0 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Local First
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Speaks <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Your Language</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Built by South Africans, for South Africans. Full Afrikaans translation available at the click of a button.
            </p>
          </motion.div>

          {/* Language Toggle Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-center gap-4 mb-8">
                <Languages className="w-10 h-10 text-[hsl(217,90%,40%)]" />
                <span className="text-2xl font-bold text-gray-900">Language Settings</span>
              </div>

              {/* Toggle Mockup */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-gray-100 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="text-lg font-bold text-gray-700">English</div>
                  <div className="text-sm text-gray-500">Default language</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl p-4 text-center cursor-pointer shadow-lg"
                >
                  <div className="text-lg font-bold text-white">Afrikaans</div>
                  <div className="text-sm text-blue-100">Volledig vertaal</div>
                </motion.div>
              </div>

              {/* SA Flag Colors Bar */}
              <div className="flex rounded-full overflow-hidden h-2 mb-6">
                <div className="flex-1 bg-green-600"></div>
                <div className="flex-1 bg-yellow-400"></div>
                <div className="flex-1 bg-black"></div>
                <div className="flex-1 bg-white border-y border-gray-200"></div>
                <div className="flex-1 bg-red-600"></div>
                <div className="flex-1 bg-[hsl(217,90%,40%)]"></div>
              </div>

              <p className="text-center text-gray-600">
                Switch between languages anytime—no restart needed
              </p>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-xl text-gray-500 italic">
              "Gebou deur Suid-Afrikaners, vir Suid-Afrikaners"
            </p>
            <p className="text-gray-400 mt-2">Built by South Africans, for South Africans</p>
          </motion.div>
        </div>
      </section>
      {/* 7-Day Free Trial Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50 to-gray-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-32 w-96 h-96 bg-[hsl(217,90%,40%)]/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(217,90%,40%)]/5 rounded-full blur-3xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Zero Risk Forever
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              7 Days <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">Completely Free</span>, Then Only Pay When You Sell
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              No credit card. No monthly fees. No risk—ever. If you don't make sales, you don't pay a cent.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Full 7 Days Free</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete access to all features with zero charges for your entire first week
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Credit Card Needed</h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up instantly without any payment information. Start selling right away
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pay Only What You Sell</h3>
              <p className="text-gray-600 leading-relaxed">
                Don't use it? Don't pay. Simple as that—only 0.5% when you make sales
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
              className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] font-bold px-12 py-6 text-lg shadow-2xl shadow-blue-500/30 transform hover:scale-105 transition-all"
              data-testid="button-trial-cta"
            >
              <Link href="/pos/signup">Start Your Free Trial Now →</Link>
            </Button>
            <p className="mt-6 text-gray-600 text-sm">
              After 7 days: 0.5% per sale + R0.50 per invoice. No sales? No charge. Ever.
            </p>
          </motion.div>
        </div>
      </section>
      {/* Usage-Based Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-0 right-1/4 w-96 h-96 bg-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-1/4 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-6"
            >
              <span className="text-sm font-bold uppercase tracking-wider text-[hsl(217,90%,40%)] bg-[hsl(217,90%,40%)]/10 px-6 py-2 rounded-full">
                Fair Pricing Model
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              We Only Make Money<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">When You Do</span>
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Just 0.5% on every sale, plus R0.50 per invoice you create. 
                  No hidden costs, no surprises—you only pay when you succeed.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-xl font-bold text-[hsl(217,90%,40%)] mb-1">0.5%</div>
                  <div className="text-xs text-gray-600">Per Sale</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-xl font-bold text-[hsl(217,90%,40%)] mb-1">R0.50</div>
                  <div className="text-xs text-gray-600">Per Invoice</div>
                </div>
                <div className="text-center p-4 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-xl font-bold text-[hsl(217,90%,40%)] mb-1">R0</div>
                  <div className="text-xs text-gray-600">Monthly Fee</div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Benefits */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 shadow-2xl border border-[hsl(217,90%,40%)]/20 bg-white/70 backdrop-blur-xl">
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
            className="bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-2xl p-8 shadow-2xl"
          >
            <h4 className="text-2xl font-bold text-center text-gray-900 mb-8">See How Affordable It Really Is</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-[hsl(217,90%,40%)]/10 to-[hsl(217,90%,50%)]/10 rounded-xl border border-[hsl(217,90%,40%)]/20 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">R1,000</div>
                <div className="text-gray-600 mb-2">Daily Sales</div>
                <div className="text-sm text-gray-700">You pay only <strong className="text-[hsl(217,90%,40%)]">R5/day</strong></div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl shadow-xl transform scale-105 text-white">
                <div className="text-3xl font-bold mb-2">R5,000</div>
                <div className="text-blue-100 mb-2">Daily Sales</div>
                <div className="text-sm">You pay only <strong>R25/day</strong></div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-[hsl(217,90%,40%)]/10 to-[hsl(217,90%,50%)]/10 rounded-xl border border-[hsl(217,90%,40%)]/20 hover:shadow-lg transition-all">
                <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">R10,000</div>
                <div className="text-gray-600 mb-2">Daily Sales</div>
                <div className="text-sm text-gray-700">You pay only <strong className="text-[hsl(217,90%,40%)]">R50/day</strong></div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white hover:from-[hsl(217,90%,45%)] hover:to-[hsl(217,90%,55%)] font-semibold px-8 shadow-lg transform hover:scale-105 transition-all"
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