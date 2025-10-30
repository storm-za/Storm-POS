import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Smartphone, Cloud, TrendingUp, Users, Shield, Zap, ArrowLeft } from "lucide-react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM__500_x_250_px_-removebg-preview_1761856744843.png";
import deviceMockup from "@assets/STORM__16_-removebg-preview_1761854439596.png";
import laptopMockup from "@assets/STORM__17_-removebg-preview_1761855220519.png";
import mobileMockup from "@assets/STORM__18_-removebg-preview_1761855233465.png";

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
                  className="absolute -top-8 -right-4 lg:right-0 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl z-30"
                >
                  <div className="flex items-center gap-1.5 lg:gap-3">
                    <div className="w-1.5 h-1.5 lg:w-3 lg:h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-[0.5rem] lg:text-xs font-medium opacity-90">System Status</div>
                      <div className="text-xs lg:text-lg font-bold">99.9%</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute top-1/3 -left-8 bg-white backdrop-blur-xl text-[hsl(217,90%,40%)] px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border border-[hsl(217,90%,40%)] lg:border-2 z-30"
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
                  className="absolute bottom-1/4 -right-8 bg-white backdrop-blur-xl text-[hsl(217,90%,40%)] px-3 py-2 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border border-green-500 lg:border-2 z-30"
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
              After 7 days: 0.5% per sale. No sales? No charge. Ever. No contracts, no commitments.
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
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Only 0.5% Per Sale</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  That's just 50 cents for every R100 you sell. No matter how small your business, 
                  you'll never pay more than what's fair for your success.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold text-[hsl(217,90%,40%)] mb-2">R0</div>
                  <div className="text-sm text-gray-600">Setup Fee</div>
                </div>
                <div className="text-center p-6 bg-white/70 backdrop-blur-xl border border-[hsl(217,90%,40%)]/20 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="text-2xl font-bold text-[hsl(217,90%,40%)] mb-2">R0</div>
                  <div className="text-sm text-gray-600">Monthly Fee</div>
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