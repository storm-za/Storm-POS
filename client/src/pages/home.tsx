import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, ScanBarcode, TrendingUp, Users, Award, Shield, CheckCircle, Star, ChevronDown, ChevronUp } from "lucide-react";
import Footer from "@/components/footer";
import stormLogo from "@assets/STORM (10)_1759748743787.png";
import { updatePageSEO } from "@/lib/seo";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Storm - Smart Software. Built for Growth.',
      description: 'Professional websites and software solutions for South African businesses. Monthly packages starting from R799. Get a stunning website or powerful POS system today.',
      canonical: window.location.origin + '/'
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
      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
              <span className="text-[hsl(217,90%,40%)]">Smart Software.</span><br />
              Built for Growth.
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              From stunning websites to pricing automation – we've got you covered.
            </motion.p>
            
            <motion.div variants={fadeInUp}>
              <Button 
                size="lg" 
                className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)] transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={() => {
                  const solutionsSection = document.querySelector('#solutions-section');
                  if (solutionsSection) {
                    solutionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Explore Our Solutions
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Solutions Section with Modern Design */}
      <section id="solutions-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
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
              className="inline-flex items-center px-4 py-2 bg-[hsl(217,90%,40%)]/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-[hsl(217,90%,40%)]/20"
            >
              <span className="w-2 h-2 bg-[hsl(217,90%,40%)] rounded-full mr-2 animate-pulse"></span>
              Our Premium Solutions
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything Your Business 
              <span className="text-[hsl(217,90%,40%)]"> Needs to Thrive</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From stunning websites to intelligent business tools – we deliver solutions that scale with your success
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Web Development Card */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Code className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[hsl(217,90%,40%)] transition-colors duration-300">Web Development</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">Professional websites that convert visitors into customers with modern design and lightning-fast performance</p>
                  <Button asChild className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)] shadow-lg hover:shadow-xl transition-all duration-300">
                    <Link href="/web-development">
                      Start Your Project
                      <motion.span 
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                        initial={{ x: 0 }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* POS Software Card */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg z-10">
                  Available Now
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ScanBarcode className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[hsl(217,90%,40%)] transition-colors duration-300">Storm POS</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">Revolutionary all device design point of sale system designed specifically for South African retailers</p>
                  <Button 
                    asChild 
                    className="bg-[hsl(217,90%,45%)] text-white hover:bg-[hsl(217,90%,40%)] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href="/pos">
                      Explore POS System
                      <motion.span 
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                        initial={{ x: 0 }}
                      >
                        →
                      </motion.span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Pricing Tracker Card */}
            <motion.div variants={fadeInUp}>
              <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 h-full hover:-translate-y-2">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  Coming Soon
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-8 text-center h-full flex flex-col">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="text-white h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors duration-300">Pricing Intelligence</h3>
                  <p className="text-gray-600 mb-6 flex-grow leading-relaxed">Advanced market analysis and competitor tracking to optimize your pricing strategy in real-time</p>
                  <Button disabled className="bg-gray-400 text-white cursor-not-allowed shadow-lg">
                    Notify Me When Ready
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
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
              About <span className="text-[hsl(217,90%,40%)]">Storm</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're passionate about empowering South African businesses with cutting-edge technology that drives real growth and success.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Storm was founded with a simple yet powerful mission: to democratize access to premium business technology. We believe every South African business, regardless of size, deserves enterprise-level software solutions.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From our headquarters in South Africa, we've built a team of passionate developers, designers, and business strategists who understand the unique challenges local businesses face. Our solutions aren't just software – they're growth accelerators.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-[hsl(217,90%,40%)]/5 to-transparent rounded-2xl border border-[hsl(217,90%,40%)]/10">
                  <div className="text-3xl font-bold text-[hsl(217,90%,40%)] mb-2">500+</div>
                  <div className="text-sm text-gray-600">Happy Clients</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-[hsl(217,90%,45%)]/5 to-transparent rounded-2xl border border-[hsl(217,90%,45%)]/10">
                  <div className="text-3xl font-bold text-[hsl(217,90%,45%)] mb-2">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl border border-purple-500/10">
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl border border-amber-500/10">
                  <div className="text-3xl font-bold text-amber-600 mb-2">5+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,40%)] to-[hsl(217,90%,50%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Expert Team</h4>
              <p className="text-gray-600">Our skilled developers and designers bring years of experience to every project</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[hsl(217,90%,45%)] to-[hsl(217,90%,55%)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Quality First</h4>
              <p className="text-gray-600">We never compromise on quality, delivering solutions that exceed expectations</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Trusted & Secure</h4>
              <p className="text-gray-600">Enterprise-grade security and reliability you can count on</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-600/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl"></div>
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
              What Our <span className="text-[hsl(217,90%,40%)]">Clients Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real feedback from South African businesses who've transformed their operations with Storm
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
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "Storm transformed our online presence completely. Our new website converts visitors into customers like never before. Sales increased by 300% in just two months!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">SA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Anderson</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "Storm POS revolutionized our retail operations. The all device design means we can serve customers anywhere in our store. It's incredibly intuitive and reliable."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">MV</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Michael Van Der Merwe</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "The support team at Storm is exceptional. They understand our business needs and always deliver beyond expectations. Their solutions just work!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">TM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Thabo Mthembu</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our services and solutions
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
                <Card className="border border-gray-200 hover:border-[hsl(217,90%,40%)]/30 transition-all duration-300 overflow-hidden">
                  <button
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
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
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl mx-auto">
              Join hundreds of South African businesses who've accelerated their growth with Storm's innovative solutions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="group bg-white text-[hsl(217,90%,40%)] hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl px-8 py-4 text-lg font-semibold"
              >
                <Link href="/web-development">
                  Get Your Website
                  <motion.span 
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                    initial={{ x: 0 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="group border-2 border-white text-white bg-transparent hover:bg-white hover:text-[hsl(217,90%,40%)] transition-all duration-300 font-semibold px-8 py-4 text-lg"
              >
                <Link href="/pos">
                  Try Storm POS
                  <motion.span 
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                    initial={{ x: 0 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center justify-center mt-8 text-blue-200 text-sm"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              No setup fees • Start immediately • Cancel anytime
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
