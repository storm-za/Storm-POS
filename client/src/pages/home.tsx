import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Code, ScanBarcode, TrendingUp } from "lucide-react";
import HeroSVG from "@/components/hero-svg";
import Footer from "@/components/footer";

export default function Home() {
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <HeroSVG />
            
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

      {/* Products Section */}
      <section id="solutions-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our SaaS Solutions</h2>
            <p className="text-xl text-gray-600">Powerful tools designed for modern businesses</p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Web Development Card */}
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 shadow-xl h-full">
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className="w-16 h-16 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Code className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Web Development</h3>
                  <p className="text-gray-600 mb-6 flex-grow">Custom websites for modern businesses</p>
                  <Button asChild className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]">
                    <Link href="/web-development">More Info</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* POS Software Card */}
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 shadow-xl h-full relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ScanBarcode className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">POS Software</h3>
                  <p className="text-gray-600 mb-6 flex-grow">A full-featured POS system for modern retailers</p>
                  <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Pricing Tracker Card */}
            <motion.div variants={fadeInUp}>
              <Card className="glassmorphism hover:scale-105 transition-all duration-300 shadow-xl h-full relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
                <CardContent className="p-8 text-center h-full flex flex-col">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pricing Tracker</h3>
                  <p className="text-gray-600 mb-6 flex-grow">Track your market, suppliers & competitors in real time</p>
                  <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
