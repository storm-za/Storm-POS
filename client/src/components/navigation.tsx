import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const StormLogo = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="w-10 h-10">
      {/* Outer circle with gradient */}
      <circle cx="50" cy="50" r="45" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
      <circle cx="50" cy="50" r="42" fill="#f1f5f9"/>
      
      {/* Lightning bolt - main body in gray */}
      <path 
        d="M35 25 L25 45 H40 L38 55 L48 35 H33 L35 25 Z" 
        fill="#64748b"
        style={{
          filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
        }}
      />
      
      {/* Lightning bolt - blue accent */}
      <path 
        d="M30 20 L20 40 H35 L33 50 L43 30 H28 L30 20 Z" 
        fill="#1e40af"
        style={{
          filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"
        }}
      />
    </svg>
  );

  return (
    <nav className="glassmorphism fixed w-full top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Storm Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <StormLogo />
            <span className="text-xl font-black text-gray-900 tracking-wide">STORM</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-gray-700 hover:text-[hsl(217,90%,40%)] transition-colors duration-200 font-medium ${
                location === '/' ? 'text-[hsl(217,90%,40%)]' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/web-development" 
              className={`text-gray-700 hover:text-[hsl(217,90%,40%)] transition-colors duration-200 font-medium ${
                location === '/web-development' ? 'text-[hsl(217,90%,40%)]' : ''
              }`}
            >
              Web Development
            </Link>
            <Button asChild className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]">
              <Link href="/web-development">Get Started</Link>
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[hsl(217,90%,40%)]"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glassmorphism">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link 
              href="/" 
              className="block px-3 py-2 text-gray-700 hover:text-[hsl(217,90%,40%)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/web-development" 
              className="block px-3 py-2 text-gray-700 hover:text-[hsl(217,90%,40%)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Web Development
            </Link>
            <Button asChild className="w-full mt-2 bg-[hsl(217,90%,40%)] text-white">
              <Link href="/web-development" onClick={() => setIsMobileMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
