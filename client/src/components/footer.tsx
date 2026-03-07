import { Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

import stormLogoPath from "@assets/wilgerrusorania.co.za (11)_1751022573240.png";
import stormTextPath from "@assets/wilgerrusorania.co.za__13_-removebg-preview_1751022992745.png";
import wilgerrusorania_co_za__12__removebg_preview from "@assets/wilgerrusorania.co.za__12_-removebg-preview.png";

export default function Footer() {
  const StormLogo = () => (
    <img 
      src={wilgerrusorania_co_za__12__removebg_preview} 
      alt="Storm Logo" 
      className="w-10 h-10 object-contain"
    />
  );

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 pt-16 pb-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[hsl(217,90%,20%)]/20 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, hsl(217,90%,60%) 1px, transparent 1px), linear-gradient(to bottom, hsl(217,90%,60%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-[hsl(217,90%,50%)]/20 blur-xl rounded-full" />
                <StormLogo />
              </div>
              <img 
                src={stormTextPath} 
                alt="STORM" 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              Empowering South African businesses with <span className="text-white font-medium">smart software solutions</span> and professional web development services.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="mailto:softwarebystorm@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-[hsl(217,90%,50%)]/30 transition-all duration-300 text-sm"
              >
                <Mail className="w-4 h-4 text-[hsl(217,90%,50%)]" />
                Contact Us
              </a>
            </div>
          </div>
          
          {/* Resources Section */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full"></span>
              Resources
            </h4>
            <div className="space-y-3">
              <Link href="/blog" className="block text-gray-400 hover:text-[hsl(217,90%,60%)] transition-colors duration-300">
                Blog
              </Link>
              <Link href="/web-development" className="block text-gray-400 hover:text-[hsl(217,90%,60%)] transition-colors duration-300">
                Web Development
              </Link>
              <Link href="/pos" className="block text-gray-400 hover:text-[hsl(217,90%,60%)] transition-colors duration-300">
                Storm POS
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-[hsl(217,90%,60%)] transition-colors duration-300">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Contact Section */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[hsl(217,90%,50%)] rounded-full"></span>
              Get In Touch
            </h4>
            <div className="space-y-4">
              <a 
                href="mailto:softwarebystorm@gmail.com"
                className="flex items-center text-gray-400 hover:text-[hsl(217,90%,60%)] transition-colors duration-300 group"
              >
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center mr-3 group-hover:bg-[hsl(217,90%,40%)]/20 transition-colors duration-300">
                  <Mail className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                </div>
                <span className="text-sm">softwarebystorm@gmail.com</span>
              </a>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-[hsl(217,90%,50%)]" />
                </div>
                <span className="text-sm">South Africa</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Storm. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">Proudly South African</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <Link href="/privacy" className="text-gray-500 hover:text-[hsl(217,90%,60%)] transition-colors duration-300">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
