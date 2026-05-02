import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check, ArrowLeft, RocketLaunch as Zap, ShieldCheck as Shield,
  DeviceMobile as Smartphone, MagnifyingGlass as Search,
  CaretDown as ChevronDown, CaretUp as ChevronUp,
  CheckCircle, XCircle, Users, MapPin, Star, TrendUp as TrendingUp
} from "@phosphor-icons/react";
import ContactForm from "@/components/contact-form";
import stormLogo from "@assets/STORM (10)_1759748743787.png";
import { updatePageSEO } from "@/lib/seo";
import WebBuildHeroIllustration from "@/components/illustrations/WebBuildHeroIllustration";
import WebDevIllustration from "@/components/illustrations/WebDevIllustration";
import BuildProcessIllustration from "@/components/illustrations/BuildProcessIllustration";
import GrowthAnalyticsIllustration from "@/components/illustrations/GrowthAnalyticsIllustration";

export default function WebDevelopment() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Professional Web Development - Storm | Monthly Packages from R799',
      description: 'Get a professional website for your South African business with monthly packages starting at R799. Custom design, mobile-optimized, SEO-ready. No large upfront costs.',
      canonical: window.location.origin + '/web-development'
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

  const scrollToContact = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Optimized for speed with 2-second load times that keep visitors engaged." },
    { icon: Smartphone, title: "Mobile First", description: "Perfect on every device — 70% of your visitors come from mobile." },
    { icon: Search, title: "SEO Optimized", description: "Rank higher on Google with advanced on-page SEO best practices." },
    { icon: Shield, title: "Bank-Level Security", description: "SSL certificates and robust security protect your business and customers." }
  ];

  const processSteps = [
    { number: "01", title: "Discovery", description: "We learn about your business, goals, and vision through our online form." },
    { number: "02", title: "Design", description: "Our team creates a custom design that reflects your brand identity." },
    { number: "03", title: "Development", description: "We build your site with modern technology and best practices." },
    { number: "04", title: "Launch", description: "Your website goes live and we provide ongoing support." }
  ];

  const wantMore = [
    "Fast, mobile-ready websites",
    "More qualified leads",
    "Better SEO visibility",
    "Professional online presence"
  ];

  const wantLess = [
    "Missed deadlines",
    "Overpriced developers",
    "Broken websites",
    "Poor communication"
  ];

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

      {/* ─────────────────────────────────────────── HERO (LIGHT) */}
      <section className="relative pt-8 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-gray-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[hsl(217,90%,60%)]/8 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[hsl(217,90%,60%)]/5 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }} />
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
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Left column */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center lg:justify-start mb-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[hsl(217,90%,60%)]/10 blur-2xl rounded-full scale-150" />
                  <img src={stormLogo} alt="Storm" className="relative h-24 w-auto drop-shadow-lg" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center px-5 py-2 mb-6 bg-[hsl(217,90%,50%)]/10 backdrop-blur-xl rounded-full border border-[hsl(217,90%,50%)]/20 shadow-lg"
              >
                <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full mr-3 animate-pulse" />
                <span className="text-sm font-medium text-[hsl(217,90%,35%)]">Enterprise Web Development</span>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                variants={fadeInUp}
              >
                <span className="bg-gradient-to-r from-[hsl(217,90%,40%)] via-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] bg-clip-text text-transparent">Professional Websites.</span>
                <br />
                <span className="text-gray-900">Without High Upfront Costs.</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                variants={fadeInUp}
              >
                Storm helps South African businesses grow online with <span className="text-gray-900 font-medium">powerful monthly web solutions.</span>
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={scrollToContact}
                  size="lg"
                  className="bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,40%)] text-white hover:from-[hsl(217,90%,50%)] hover:to-[hsl(217,90%,45%)] transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-blue-500/30 px-8 py-6 text-lg font-semibold"
                >
                  Get Your Website Today
                  <motion.span className="ml-2" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm"
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
            </div>

            {/* Right column - hero illustration */}
            <motion.div
              variants={fadeInUp}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-2xl">
                <div className="absolute -inset-4 bg-gradient-to-br from-[hsl(217,90%,60%)]/20 to-[hsl(217,90%,40%)]/10 rounded-3xl blur-2xl" />
                <WebBuildHeroIllustration className="relative w-full h-auto drop-shadow-2xl" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── SOCIAL PROOF STATS BAR */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">200+</div>
              <div className="text-sm text-gray-500 font-medium">Websites Built</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">R799</div>
              <div className="text-sm text-gray-500 font-medium">Starting Monthly</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">2 Weeks</div>
              <div className="text-sm text-gray-500 font-medium">Average Delivery</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[hsl(217,90%,40%)]">4.9/5</div>
              <div className="text-sm text-gray-500 font-medium">Client Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── WHY CHOOSE STORM (LIGHT, 2-COL SPLIT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
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
              className="inline-flex items-center px-4 py-2 bg-[hsl(217,90%,40%)]/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-[hsl(217,90%,40%)]/20"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,40%)] rounded-full mr-2 animate-pulse" />
              Why Choose Storm
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to <span className="text-[hsl(217,90%,40%)]">Succeed Online</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We deliver fast, beautiful, and high-performing websites that drive real business results.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center lg:justify-start"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-4 bg-gradient-to-br from-[hsl(217,90%,60%)]/15 to-[hsl(217,90%,40%)]/5 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <WebDevIllustration className="w-full h-auto" />
                </div>
              </div>
            </motion.div>

            {/* Inline benefit rows */}
            <motion.ul
              className="space-y-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {features.map((feature) => (
                <motion.li
                  key={feature.title}
                  variants={fadeInUp}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[hsl(217,90%,40%)]/10 border border-[hsl(217,90%,40%)]/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── HOW IT WORKS (SLATE) */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-[hsl(217,90%,60%)]/20 to-[hsl(217,90%,40%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-cyan-400/15 to-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
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
              <span className="text-sm font-medium text-gray-400">Our Process</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">How </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">It Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From initial contact to launch, we make the process <span className="text-white font-medium">simple and transparent.</span>
            </p>
          </motion.div>

          {/* Build process illustration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute -inset-6 bg-gradient-to-br from-[hsl(217,90%,60%)]/15 to-[hsl(217,90%,40%)]/5 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl p-6 md:p-10 shadow-2xl">
                <BuildProcessIllustration className="w-full h-auto" />
              </div>
            </div>
          </motion.div>

          {/* Step cards */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {processSteps.map((step) => (
              <motion.div key={step.number} variants={fadeInUp}>
                <Card className="group h-full bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/40 transition-all duration-300 shadow-2xl hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(217,90%,40%)]/15 border border-[hsl(217,90%,50%)]/30 text-[hsl(217,90%,60%)] font-bold text-sm mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[hsl(217,90%,60%)] transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── REAL RESULTS (SLATE, 2-COL SPLIT) */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[hsl(217,90%,30%)]/10 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
          <motion.div
            className="absolute -top-40 -right-32 w-96 h-96 bg-[hsl(217,90%,50%)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
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
              <TrendingUp className="w-4 h-4 text-[hsl(217,90%,60%)] mr-2" />
              <span className="text-sm font-medium text-gray-400">Real Results</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Real </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">Results</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Success stories from South African businesses we've <span className="text-white font-medium">helped grow.</span>
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Growth analytics illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center lg:justify-start"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-4 bg-gradient-to-br from-[hsl(217,90%,60%)]/20 to-[hsl(217,90%,40%)]/10 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                  <GrowthAnalyticsIllustration className="w-full h-auto" />
                </div>
              </div>
            </motion.div>

            {/* Testimonial cards (slate enterprise style) */}
            <motion.div
              className="space-y-5"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">+300%</div>
                  </div>
                  <p className="text-gray-300 italic mb-3 leading-relaxed">
                    "Storm delivered exactly what we needed. <span className="text-white font-medium">Our online sales tripled</span> within the first quarter!"
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-white">John Botha</span>
                    <span className="text-gray-500"> · Retail Owner, Cape Town</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">2 Weeks</div>
                  </div>
                  <p className="text-gray-300 italic mb-3 leading-relaxed">
                    "Fast, professional, and the quality exceeded our expectations. <span className="text-white font-medium">No hassle, just results.</span>"
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-white">Linda Mokoena</span>
                    <span className="text-gray-500"> · Restaurant Owner, Johannesburg</span>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">#1</div>
                  </div>
                  <p className="text-gray-300 italic mb-3 leading-relaxed">
                    "Now we're <span className="text-white font-medium">ranking first on Google</span> for our main keywords. The leads just keep coming!"
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold text-white">Peter De Villiers</span>
                    <span className="text-gray-500"> · Law Firm, Pretoria</span>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── PRICING (LIGHT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-[hsl(217,90%,40%)]">Monthly Packages</span>
            </h2>
            <p className="text-xl text-gray-600">All plans include hosting, support, SEO updates, and design</p>
            <p className="text-lg text-[hsl(217,90%,40%)] font-semibold mt-2">✓ No calls needed.</p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Starter Package */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R799<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />5-page responsive website</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Mobile optimization</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Basic SEO setup</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Hosting included</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Monthly updates</li>
                  </ul>
                  <Button
                    onClick={scrollToContact}
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)] shadow-lg"
                    data-testid="button-starter-package"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Growth Package - Most Popular (preserved) */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-2xl text-white transform scale-105 relative bg-gradient-to-br from-[hsl(217,90%,35%)] via-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] ring-4 ring-[hsl(217,90%,50%)]/40">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-400 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl tracking-wide uppercase">
                  Most Popular
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col pt-10">
                  <h3 className="text-2xl font-bold mb-2">Growth</h3>
                  <div className="text-4xl font-bold mb-4">
                    R1,499<span className="text-lg text-blue-200">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-blue-100 mb-8 flex-grow">
                    <li className="flex items-center"><Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />10-page responsive website</li>
                    <li className="flex items-center"><Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />E-commerce functionality</li>
                    <li className="flex items-center"><Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />Advanced SEO</li>
                    <li className="flex items-center"><Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />Priority support</li>
                  </ul>
                  <Button
                    onClick={scrollToContact}
                    className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 shadow-xl font-bold text-base"
                    data-testid="button-growth-package"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Package */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R2,499+<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Unlimited pages</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Advanced integrations</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Dedicated support</li>
                    <li className="flex items-center"><Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />Performance optimization</li>
                  </ul>
                  <Button
                    onClick={scrollToContact}
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)] shadow-lg"
                    data-testid="button-pro-package"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── TECH STACK (LIGHT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built with <span className="text-[hsl(217,90%,40%)]">Modern Technology</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We use cutting-edge tools and frameworks to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "AWS", "Vercel"].map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <span className="text-lg font-bold text-gray-800">{tech}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── FAQ (LIGHT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked <span className="text-[hsl(217,90%,40%)]">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our web development services.
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
                question: "How long does it take to build a website?",
                answer: "Most websites are completed within 2-4 weeks, depending on complexity. Our Starter package typically takes 2 weeks, Growth takes 3 weeks, and Pro can take 4-6 weeks. We provide regular updates throughout the process."
              },
              {
                question: "Do I own the website after it's built?",
                answer: "Yes! While we host and maintain your website as part of the monthly package, you own all the content and can request a full copy of your site at any time. There's no vendor lock-in."
              },
              {
                question: "What's included in the monthly fee?",
                answer: "Your monthly fee includes hosting, SSL certificates, security updates, technical support, minor content updates, performance monitoring, and SEO maintenance. It's everything you need to keep your site running smoothly."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, there are no long-term contracts. You can cancel your monthly package with 30 days notice. We'll even help you migrate your site if you choose to host it elsewhere."
              },
              {
                question: "Do you provide content and images?",
                answer: "We recommend you provide your own content and images for authenticity. However, we can write content and source stock images for an additional fee. We'll guide you through exactly what we need."
              },
              {
                question: "Will my website work on mobile devices?",
                answer: "Absolutely! All our websites are mobile-first, meaning they're designed and tested primarily for mobile devices, then enhanced for desktop. Over 70% of web traffic is mobile, so this is critical."
              },
              {
                question: "How do you handle SEO?",
                answer: "We build SEO into every site from day one: fast load times, mobile optimization, proper meta tags, structured data, sitemap generation, and clean code. We also provide ongoing SEO maintenance as part of your monthly package."
              },
              {
                question: "What if I need changes after launch?",
                answer: "Minor updates are included in your monthly package. For major redesigns or new features, we'll provide a quote. We're always here to help your site grow with your business."
              }
            ].map((faq, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="overflow-hidden border-2 border-gray-100 hover:border-[hsl(217,90%,40%)]/30 transition-all duration-300">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    data-testid={`faq-question-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</h3>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${openFaq === index ? 'bg-[hsl(217,90%,40%)]' : 'bg-gray-100'}`}>
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed" data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── TARGET MARKET (SLATE TRUST STRIP) */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
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
              <span className="text-sm font-medium text-gray-400">Who We Serve</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Built for </span>
              <span className="bg-gradient-to-r from-[hsl(217,90%,60%)] to-[hsl(217,90%,50%)] bg-clip-text text-transparent">South African SMEs</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Supporting illustration */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center lg:justify-start"
            >
              <div className="relative w-full max-w-xl">
                <div className="absolute -inset-4 bg-gradient-to-br from-[hsl(217,90%,60%)]/20 to-[hsl(217,90%,40%)]/10 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-2xl p-6 shadow-2xl">
                  <WebDevIllustration className="w-full h-auto" />
                </div>
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="p-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="px-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(217,90%,40%)]/15 border border-[hsl(217,90%,50%)]/30 mb-3">
                    <Users className="w-6 h-6 text-[hsl(217,90%,60%)]" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">SME Owners</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ages 30–50</div>
                </div>
                <div className="sm:border-x sm:border-white/10 px-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(217,90%,40%)]/15 border border-[hsl(217,90%,50%)]/30 mb-3">
                    <MapPin className="w-6 h-6 text-[hsl(217,90%,60%)]" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">Urban Hubs</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">JHB · CPT · DBN</div>
                </div>
                <div className="px-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(217,90%,40%)]/15 border border-[hsl(217,90%,50%)]/30 mb-3">
                    <TrendingUp className="w-6 h-6 text-[hsl(217,90%,60%)]" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">Growth-Oriented</div>
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ready to scale</div>
                </div>
              </div>
              <p className="mt-8 text-center text-sm text-gray-400 leading-relaxed">
                Business leaders tired of bad freelancers and DIY website builders — ready for a <span className="text-white font-medium">professional online presence.</span>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── WANT MORE vs WANT LESS (LIGHT, ENTERPRISE) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(217,90%,45%)] mb-4">The Storm Difference</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight">
              What You Want <span className="text-[hsl(217,90%,40%)]">vs.</span> What You Don't
            </h2>
            <p className="mt-4 text-gray-500 text-base max-w-md mx-auto leading-relaxed">
              See exactly what working with Storm delivers — and what you'll never deal with again.
            </p>
          </motion.div>

          <motion.div
            className="grid lg:grid-cols-2 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Want More - Highlighted Storm winner */}
            <motion.div variants={fadeInUp}>
              <Card className="relative h-full overflow-hidden bg-gradient-to-br from-[hsl(217,90%,40%)] via-[hsl(217,90%,42%)] to-[hsl(217,90%,48%)] text-white shadow-2xl border-0">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }} />
                <CardContent className="relative p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/15 text-white text-[10px] font-semibold uppercase tracking-widest backdrop-blur-sm">
                      <Star weight="fill" className="w-2.5 h-2.5 text-amber-300" />
                      Recommended
                    </div>
                    <div className="text-2xl font-bold">Want More</div>
                  </div>
                  <ul className="space-y-4">
                    {wantMore.map((item) => (
                      <li key={item} className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 shadow-lg shadow-emerald-900/30 flex-shrink-0">
                          <Check className="w-4 h-4 text-white" weight="bold" />
                        </span>
                        <span className="text-base font-medium text-white leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-white/15">
                    <Button
                      onClick={scrollToContact}
                      className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 font-bold shadow-lg"
                    >
                      Start Your Project →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Want Less - Muted greyed loser */}
            <motion.div variants={fadeInUp}>
              <Card className="relative h-full overflow-hidden bg-gray-50 border-2 border-gray-200 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-semibold uppercase tracking-widest">
                      The Old Way
                    </div>
                    <div className="text-2xl font-bold text-gray-400">Want Less</div>
                  </div>
                  <ul className="space-y-4">
                    {wantLess.map((item) => (
                      <li key={item} className="flex items-center gap-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 border border-red-200 flex-shrink-0">
                          <XCircle className="w-4 h-4 text-red-500" weight="fill" />
                        </span>
                        <span className="text-base font-medium text-gray-500 line-through decoration-gray-300 leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-400">Stick with the old freelancer route</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── CONTACT FORM (LIGHT) */}
      <section id="contact-form" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[hsl(217,90%,60%)]/10 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Let's Build <span className="text-[hsl(217,90%,40%)]">Your Website</span>
            </h2>
            <p className="text-xl text-gray-600">📩 Prefer Email Over Calls? Same Here. We do everything online.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── TESTIMONIALS (LIGHT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-[hsl(217,90%,40%)]/10 rounded-full border border-[hsl(217,90%,40%)]/20">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />
              <span className="text-sm font-medium text-[hsl(217,90%,40%)]">Client Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Clients <span className="text-[hsl(217,90%,40%)]">Are Saying</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              South African businesses sharing their real results.
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
              <Card className="h-full bg-white border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed italic">
                  "Storm built us a professional website for a fraction of what agencies quoted us. It was live in 2 weeks, it ranks on Google, and <strong className="text-gray-900">we get new customer enquiries every week</strong> through the contact form."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">PM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Priya Moodley</div>
                    <div className="text-sm text-gray-500">Accounting Firm Owner, Durban</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed italic">
                  "No calls needed, everything done online. Storm was easy to work with, communicated clearly, and delivered exactly what we discussed. <strong className="text-gray-900">Our online bookings have doubled</strong> since launch."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-[hsl(217,90%,50%)] rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">TN</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Thabo Ndlovu</div>
                    <div className="text-sm text-gray-500">Auto Detailing Business, Johannesburg</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed italic">
                  "I tried DIY website builders for two years. Storm gave me a proper professional site in 2 weeks that actually converts. <strong className="text-gray-900">Best investment I've made</strong> in my small business."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">EV</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Elaine van der Berg</div>
                    <div className="text-sm text-gray-500">Interior Decorator, Pretoria</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────── FINAL CTA (BLUE GRADIENT) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get more customers online? Let's build your website this week.
            </h2>
            <p className="text-xl text-blue-100 mb-4 max-w-2xl mx-auto leading-relaxed">
              Join the growing number of South African businesses that trust Storm for their web presence.
            </p>
            <p className="text-sm text-blue-200 mb-10 font-medium">No setup fees. No lock-in contracts. Cancel anytime.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={scrollToContact}
                size="lg"
                className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl px-10 py-6 text-lg font-bold"
                data-testid="button-cta-quote"
              >
                Get Your Website Quote
                <motion.span
                  className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  initial={{ x: 0 }}
                >
                  →
                </motion.span>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-300 font-semibold px-8 py-6 text-lg"
                data-testid="button-back-home"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
