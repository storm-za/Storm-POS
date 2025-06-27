import { Mail, MapPin } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const StormLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" className="w-8 h-8">
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
    <footer className="glassmorphism mt-16 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <StormLogo />
              <span className="text-xl font-black text-gray-900 tracking-wide">STORM</span>
            </div>
            <p className="text-gray-600 mb-4">
              Empowering South African businesses with smart software solutions and professional web development services.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact</h4>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                stormmailcompany@gmail.com
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                South Africa
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-[hsl(217,90%,40%)] rounded-full flex items-center justify-center text-white hover:bg-[hsl(217,90%,35%)] transition-colors duration-200"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600">&copy; 2024 Storm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
