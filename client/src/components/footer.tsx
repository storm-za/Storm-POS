import { Mail, MapPin } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import stormLogoPath from "@assets/wilgerrusorania.co.za (11)_1751022573240.png";
import stormTextPath from "@assets/wilgerrusorania.co.za__13_-removebg-preview_1751022992745.png";

export default function Footer() {
  const StormLogo = () => (
    <img 
      src={stormLogoPath} 
      alt="Storm Logo" 
      className="w-8 h-8 object-contain"
    />
  );

  return (
    <footer className="glassmorphism mt-16 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <StormLogo />
              <img 
                src={stormTextPath} 
                alt="STORM" 
                className="h-10 w-auto object-contain"
              />
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
