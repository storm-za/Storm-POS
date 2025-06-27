import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Users, MapPin, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import WebDevSVG from "@/components/web-dev-svg";
import ContactForm from "@/components/contact-form";

export default function WebDevelopment() {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 hero-gradient text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional Websites Without the High Upfront Cost
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Storm helps South African businesses grow online with powerful monthly web solutions.
              </p>
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >Get Your Website Today</Button>
            </motion.div>
            
            <motion.div 
              className="lg:text-right relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <WebDevSVG />
              
              {/* Floating Icons with Text */}
              <motion.div
                className="absolute -top-8 -left-12 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">Fast</span>
              </motion.div>

              <motion.div
                className="absolute top-16 -right-16 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -3, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">Secure</span>
              </motion.div>

              <motion.div
                className="absolute bottom-8 -left-8 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2
                }}
              >
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-800">Growth</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Monthly Packages</h2>
            <p className="text-xl text-gray-600">All plans include hosting, support, SEO updates, and design</p>
            <p className="text-lg text-[hsl(217,90%,40%)] font-semibold mt-2">✓ Only 12-month minimum required. No calls needed.</p>
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
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R799<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      5-page responsive website
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Mobile optimization
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Basic SEO setup
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Hosting included
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Monthly updates
                    </li>
                  </ul>
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Growth Package */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl text-white transform scale-105 relative hero-gradient">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold mb-2">Growth</h3>
                  <div className="text-4xl font-bold mb-4">
                    R1,499<span className="text-lg text-blue-200">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-blue-100 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      10-page responsive website
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      E-commerce functionality
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Advanced SEO
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Analytics dashboard
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2 h-4 w-4" />
                      Priority support
                    </li>
                  </ul>
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Pro Package */}
            <motion.div variants={fadeInUp}>
              <Card className="h-full shadow-xl border-2 border-gray-100 hover:border-[hsl(217,90%,40%)] transition-all duration-300">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-[hsl(217,90%,40%)] mb-4">
                    R2,499+<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="text-left space-y-3 text-gray-600 mb-8 flex-grow">
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Unlimited pages
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Custom development
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Advanced integrations
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Dedicated support
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-500 mr-2 h-4 w-4" />
                      Performance optimization
                    </li>
                  </ul>
                  <Button 
                    onClick={scrollToContact}
                    className="w-full bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Let's Build Your Website</h2>
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
      {/* Target Market Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for South African SMEs</h2>
          </motion.div>
          
          <motion.div 
            className="grid lg:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">SME Owners (30-50)</h3>
              <p className="text-gray-600">Business leaders who understand the value of professional web presence</p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Urban Hubs</h3>
              <p className="text-gray-600">Located in Johannesburg, Cape Town, and other major cities</p>
            </motion.div>
            
            <motion.div className="text-center" variants={fadeInUp}>
              <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth-Oriented</h3>
              <p className="text-gray-600">Tired of bad freelancers and DIY website builders</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Miracles & Miseries Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You Want vs. What You're Getting</h2>
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
              <Card className="glassmorphism shadow-xl h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Want More
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
                      Fast, mobile-ready websites
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
                      More qualified leads
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
                      Better SEO visibility
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="text-green-500 mr-3 h-5 w-5" />
                      Professional online presence
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Want Less */}
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism shadow-xl h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                    <XCircle className="mr-3 h-6 w-6" />
                    Want Less
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5" />
                      Missed deadlines
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5" />
                      Overpriced developers
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5" />
                      Broken websites
                    </li>
                    <li className="flex items-center text-gray-700">
                      <XCircle className="text-red-500 mr-3 h-5 w-5" />
                      Poor communication
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 hero-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Let's Build Your Website — On Your Terms</h2>
            <p className="text-xl text-blue-100 mb-8">Join the growing number of South African businesses that trust Storm for their web presence.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transition-all duration-200"
              >
                Get Your Website Quote
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-200"
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
