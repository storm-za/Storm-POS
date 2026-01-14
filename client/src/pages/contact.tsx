import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, ArrowLeft, Clock, MapPin, CheckCircle, Zap } from "lucide-react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM (10)_1759748743787.png";
import { updatePageSEO } from "@/lib/seo";

export default function Contact() {
  useEffect(() => {
    updatePageSEO({
      title: 'Contact Us - Storm Software Solutions',
      description: 'Get in touch with Storm for professional web development and POS solutions. We\'re here to help South African businesses grow with cutting-edge technology.',
      canonical: window.location.origin + '/contact'
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
    <div className="min-h-screen overflow-x-hidden w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(217,90%,25%)]/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[hsl(217,90%,40%)]/20 via-transparent to-transparent" />
          
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
          
          <motion.div 
            className="absolute top-20 left-1/4 w-64 h-64 bg-[hsl(217,90%,50%)]/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-1/4 w-80 h-80 bg-[hsl(217,90%,40%)]/15 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[hsl(217,90%,60%)]/60 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -40, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Button 
              asChild 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </motion.div>

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
                <div className="absolute inset-0 bg-[hsl(217,90%,50%)]/30 blur-2xl rounded-full scale-150" />
                <img src={stormLogo} alt="Storm" className="relative h-24 w-auto drop-shadow-2xl" />
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center px-5 py-2 mb-8 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-lg"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-3 animate-pulse shadow-lg shadow-blue-500/50" />
              <span className="text-sm font-medium text-gray-300">Get In Touch</span>
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              variants={fadeInUp}
            >
              <span className="text-white">Let's </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] via-[hsl(217,90%,50%)] to-[hsl(217,90%,70%)] bg-clip-text text-transparent">Connect</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Ready to transform your business? We'd love to hear from you. <span className="text-white font-medium">Let's start a conversation.</span>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Email Card - Main Contact Method */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="group relative overflow-hidden bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/40 transition-all duration-500 p-10">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(217,90%,50%)]/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                
                <div className="relative">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-[hsl(217,90%,50%)] to-[hsl(217,90%,40%)] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="text-white h-10 w-10" />
                  </div>

                  <h2 className="text-3xl font-bold text-white mb-4">Email Us</h2>
                  <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                    Send us an email and we'll get back to you within <span className="text-white font-medium">24 hours</span>. We're here to answer any questions about our services.
                  </p>

                  {/* Email Link */}
                  <a 
                    href="mailto:softwarebystorm@gmail.com"
                    className="group/link inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] transition-all duration-300"
                  >
                    <Mail className="w-5 h-5" />
                    softwarebystorm@gmail.com
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                  </a>

                  {/* Response time indicator */}
                  <div className="mt-8 flex items-center gap-3 text-gray-400">
                    <Clock className="w-5 h-5 text-[hsl(217,90%,50%)]" />
                    <span>Average response time: <span className="text-white font-medium">Under 24 hours</span></span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Why Contact Us Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Zap className="w-5 h-5 text-[hsl(217,90%,50%)]" />
                  What We Can Help With
                </h3>
                <ul className="space-y-4">
                  {[
                    "Custom website development & design",
                    "Storm POS system inquiries",
                    "Business software solutions",
                    "Technical support & questions",
                    "Partnership opportunities"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 text-gray-400"
                    >
                      <CheckCircle className="w-5 h-5 text-[hsl(217,90%,50%)] flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>

              {/* Location Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[hsl(217,90%,50%)]" />
                  Based in South Africa
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  We're proudly South African, understanding the unique challenges and opportunities local businesses face. Our solutions are built with <span className="text-white font-medium">your success in mind</span>.
                </p>
              </Card>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent mb-2">500+</div>
                  <div className="text-sm text-gray-400">Happy Clients</div>
                </div>
                <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[hsl(217,90%,55%)] to-[hsl(217,90%,45%)] bg-clip-text text-transparent mb-2">24/7</div>
                  <div className="text-sm text-gray-400">Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-12 bg-gradient-to-br from-[hsl(217,90%,35%)]/50 to-[hsl(217,90%,25%)]/50 backdrop-blur-xl rounded-3xl border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Drop us an email and let's discuss how we can help your business grow
            </p>
            <a 
              href="mailto:softwarebystorm@gmail.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[hsl(217,90%,40%)] rounded-xl font-bold text-lg shadow-2xl shadow-black/20 hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Send Us an Email
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
