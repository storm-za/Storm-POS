import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  ArrowLeft, 
  Zap, 
  Shield, 
  Smartphone, 
  Search,
  Code, 
  Palette, 
  Rocket,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  Star
} from "lucide-react";
import WebDevSVG from "@/components/web-dev-svg";
import ContactForm from "@/components/contact-form";
import stormLogo from "@assets/STORM (10)_1759748743787.png";
import { updatePageSEO } from "@/lib/seo";

export default function WebDevelopment() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Professional Web Development - Storm | Monthly Packages from R799',
      description: 'Get a professional website for your South African business with monthly packages starting at R799. Custom design, mobile-optimized, SEO-ready. No large upfront costs.',
      canonical: window.location.origin + '/web-development'
    });

    const serviceScript = document.createElement('script');
    serviceScript.type = 'application/ld+json';
    serviceScript.id = 'service-schema';
    serviceScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Web Development",
      "provider": {
        "@type": "Organization",
        "name": "Storm",
        "url": window.location.origin,
        "areaServed": "ZA",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "ZA"
        }
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter Package",
          "price": "799",
          "priceCurrency": "ZAR",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "799",
            "priceCurrency": "ZAR",
            "unitText": "MONTH"
          }
        },
        {
          "@type": "Offer",
          "name": "Growth Package",
          "price": "1499",
          "priceCurrency": "ZAR",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "1499",
            "priceCurrency": "ZAR",
            "unitText": "MONTH"
          }
        },
        {
          "@type": "Offer",
          "name": "Pro Package",
          "price": "2499",
          "priceCurrency": "ZAR",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "2499",
            "priceCurrency": "ZAR",
            "unitText": "MONTH"
          }
        }
      ]
    });

    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.id = 'business-schema';
    businessScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Storm",
      "description": "Professional web development and software solutions for South African businesses",
      "url": window.location.origin,
      "priceRange": "R799-R2499",
      "areaServed": {
        "@type": "Country",
        "name": "South Africa"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "ZA"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Web Development Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Starter Website Package",
              "description": "5-page responsive website with mobile optimization and basic SEO"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Growth Website Package",
              "description": "10-page responsive website with e-commerce and advanced SEO"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Pro Website Package",
              "description": "Unlimited pages with advanced integrations and dedicated support"
            }
          }
        ]
      }
    });

    document.head.appendChild(serviceScript);
    document.head.appendChild(businessScript);

    return () => {
      const existingServiceScript = document.getElementById('service-schema');
      const existingBusinessScript = document.getElementById('business-schema');
      if (existingServiceScript) document.head.removeChild(existingServiceScript);
      if (existingBusinessScript) document.head.removeChild(existingBusinessScript);
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

  const scrollToContact = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
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

      {/* Hero Section with High-Tech Background */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
          {[...Array(15)].map((_, i) => (
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
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-8"
            >
              <img src={stormLogo} alt="Storm" className="h-32 w-auto" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              variants={fadeInUp}
            >
              <span className="text-[hsl(217,90%,40%)]">Professional Websites</span><br />
              Without High Upfront Costs
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Storm helps South African businesses grow online with powerful monthly web solutions.
            </motion.p>
            
            <motion.div variants={fadeInUp}>
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)] transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Get Your Website Today
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features & Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
              <span className="w-2 h-2 bg-[hsl(217,90%,40%)] rounded-full mr-2 animate-pulse"></span>
              Why Choose Storm
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to 
              <span className="text-[hsl(217,90%,40%)]"> Succeed Online</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We deliver fast, beautiful, and high-performing websites that drive real business results
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Lightning Fast */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Zap className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">Optimized for speed with 2-second load times that keep visitors engaged</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile First */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile First</h3>
                  <p className="text-gray-600 text-sm">Perfect on every device - 70% of your visitors use mobile</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* SEO Optimized */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-[hsl(217,90%,50%)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">SEO Optimized</h3>
                  <p className="text-gray-600 text-sm">Rank higher on Google with our advanced SEO best practices</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bank-Level Security */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-[hsl(217,90%,50%)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bank-Level Security</h3>
                  <p className="text-gray-600 text-sm">SSL certificates and robust security protect your business</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Process Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-[hsl(217,90%,60%)]/10 to-transparent rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
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
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-[hsl(217,90%,40%)]">It Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From initial contact to launch, we make the process simple and transparent
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "1. Discovery", description: "We learn about your business, goals, and vision through our online form" },
              { icon: Palette, title: "2. Design", description: "Our team creates a custom design that reflects your brand identity" },
              { icon: Code, title: "3. Development", description: "We build your site with modern technology and best practices" },
              { icon: Rocket, title: "4. Launch", description: "Your website goes live and we provide ongoing support" }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="text-white h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </CardContent>
                </Card>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-[hsl(217,90%,40%)]/30"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Results */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real <span className="text-[hsl(217,90%,40%)]">Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Success stories from South African businesses we've helped grow
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">+300%</div>
                <div className="text-sm text-gray-500 mb-4">Online Sales Increase</div>
                <p className="text-gray-700 mb-4 italic">
                  "Storm delivered exactly what we needed. Our online sales tripled within the first quarter!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">JB</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">John Botha</div>
                    <div className="text-sm text-gray-500">Retail Owner, Cape Town</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">2 Weeks</div>
                <div className="text-sm text-gray-500 mb-4">From Start to Launch</div>
                <p className="text-gray-700 mb-4 italic">
                  "Fast, professional, and the quality exceeded our expectations. No hassle, just results."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">LM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Linda Mokoena</div>
                    <div className="text-sm text-gray-500">Restaurant Owner, Johannesburg</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">#1</div>
                <div className="text-sm text-gray-500 mb-4">Google Ranking</div>
                <p className="text-gray-700 mb-4 italic">
                  "Now we're ranking first on Google for our main keywords. The leads just keep coming!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">PD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Peter De Villiers</div>
                    <div className="text-sm text-gray-500">Law Firm, Pretoria</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SVG Illustration Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="flex justify-center items-center relative"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="relative max-w-2xl mx-auto">
              <WebDevSVG />
              
              {/* Floating Icons with Text */}
              <motion.div
                className="absolute top-2 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 shadow-lg flex items-center space-x-1 sm:space-x-2 max-w-[90px] sm:max-w-none"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[hsl(217,90%,45%)] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">Fast</span>
              </motion.div>

              <motion.div
                className="absolute top-12 right-2 sm:right-4 lg:right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 shadow-lg flex items-center space-x-1 sm:space-x-2 max-w-[100px] sm:max-w-none"
                animate={{
                  y: [0, 8, 0],
                  rotate: [0, -2, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">Secure</span>
              </motion.div>

              <motion.div
                className="absolute bottom-4 left-2 sm:left-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 shadow-lg flex items-center space-x-1 sm:space-x-2 max-w-[100px] sm:max-w-none"
                animate={{
                  y: [0, -6, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.586l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">Growth</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      5-page responsive website
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Mobile optimization
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Basic SEO setup
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Hosting included
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Monthly updates
                    </li>
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
            
            {/* Growth Package */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-2xl text-white transform scale-105 relative bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)]">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                  Most Popular
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">Growth</h3>
                  <div className="text-4xl font-bold mb-4">
                    R1,499<span className="text-lg text-blue-200">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-blue-100 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />
                      10-page responsive website
                    </li>
                    <li className="flex items-center">
                      <Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />
                      E-commerce functionality
                    </li>
                    <li className="flex items-center">
                      <Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />
                      Advanced SEO
                    </li>
                    <li className="flex items-center">
                      <Check className="text-white mr-2 h-5 w-5 flex-shrink-0" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 shadow-lg"
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
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Unlimited pages
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Advanced integrations
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Dedicated support
                    </li>
                    <li className="flex items-center">
                      <Check className="text-[hsl(217,90%,40%)] mr-2 h-5 w-5 flex-shrink-0" />
                      Performance optimization
                    </li>
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

      {/* Technology Stack */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(217,90%,40%) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(217,90%,40%) 1px, transparent 1px)
            `,
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
              We use cutting-edge tools and frameworks to deliver exceptional results
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

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
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
              Everything you need to know about our web development services
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
                <Card className="border border-gray-200 hover:border-[hsl(217,90%,40%)]/30 transition-all duration-300 overflow-hidden">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    data-testid={`faq-question-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">{faq.question}</h3>
                      <div className="flex-shrink-0">
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-[hsl(217,90%,40%)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
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

      {/* Target Market Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for <span className="text-[hsl(217,90%,40%)]">South African SMEs</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInUp}>
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">SME Owners (30-50)</h3>
                <p className="text-gray-600">Business leaders who understand the value of professional web presence</p>
              </Card>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Urban Hubs</h3>
                <p className="text-gray-600">Located in Johannesburg, Cape Town, and other major cities</p>
              </Card>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-white h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Growth-Oriented</h3>
                <p className="text-gray-600">Tired of bad freelancers and DIY website builders</p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Miracles & Miseries Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What You Want <span className="text-[hsl(217,90%,40%)]">vs.</span> What You Don't
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid lg:grid-cols-2 gap-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Want More */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent shadow-xl h-full border-2 border-[hsl(217,90%,40%)]/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[hsl(217,90%,40%)] mb-6 flex items-center">
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Want More
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-[hsl(217,90%,40%)] mr-3 h-5 w-5 flex-shrink-0" />
                      Fast, mobile-ready websites
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-[hsl(217,90%,40%)] mr-3 h-5 w-5 flex-shrink-0" />
                      More qualified leads
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-[hsl(217,90%,40%)] mr-3 h-5 w-5 flex-shrink-0" />
                      Better SEO visibility
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-[hsl(217,90%,40%)] mr-3 h-5 w-5 flex-shrink-0" />
                      Professional online presence
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Want Less */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-br from-red-50 to-transparent shadow-xl h-full border-2 border-red-200/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                    <XCircle className="mr-3 h-6 w-6" />
                    Want Less
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5 flex-shrink-0" />
                      Missed deadlines
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5 flex-shrink-0" />
                      Overpriced developers
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5 flex-shrink-0" />
                      Broken websites
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5 flex-shrink-0" />
                      Poor communication
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background gradient orb */}
        <motion.div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[hsl(217,90%,60%)]/10 to-transparent rounded-full blur-3xl"
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

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Let's Build Your Website — On Your Terms
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join the growing number of South African businesses that trust Storm for their web presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl px-8 py-4 text-lg font-semibold"
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
                className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-300 font-semibold px-8 py-4 text-lg"
                data-testid="button-back-home"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center mt-8 text-blue-200 text-sm"
            >
              <Award className="w-5 h-5 mr-2" />
              No setup fees • No long-term contracts • Cancel anytime
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
