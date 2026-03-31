import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { List as Menu, X } from "@phosphor-icons/react";
import stormLogo from "@assets/STORM (10)_1759748743787.png";

export default function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="glassmorphism fixed w-full top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 bg-[#3c445c00]">
          {/* Storm Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src={stormLogo} 
              alt="Storm" 
              className="h-12 w-auto object-contain"
            />
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
            <Link 
              href="/blog" 
              className={`text-gray-700 hover:text-[hsl(217,90%,40%)] transition-colors duration-200 font-medium ${
                location.startsWith('/blog') ? 'text-[hsl(217,90%,40%)]' : ''
              }`}
            >
              Blog
            </Link>
            <Button 
              className="bg-[hsl(217,90%,40%)] text-white hover:bg-[hsl(217,90%,35%)]"
              onClick={() => {
                const solutionsSection = document.querySelector('#solutions-section');
                if (solutionsSection) {
                  solutionsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started
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
            <Link 
              href="/blog" 
              className="block px-3 py-2 text-gray-700 hover:text-[hsl(217,90%,40%)]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Button 
              className="w-full mt-2 bg-[hsl(217,90%,40%)] text-white"
              onClick={() => {
                setIsMobileMenuOpen(false);
                const solutionsSection = document.querySelector('#solutions-section');
                if (solutionsSection) {
                  solutionsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
