import { Mail, MapPin } from "lucide-react";

import stormLogoPath from "@assets/wilgerrusorania.co.za (11)_1751022573240.png";
import stormTextPath from "@assets/wilgerrusorania.co.za__13_-removebg-preview_1751022992745.png";

import wilgerrusorania_co_za__12__removebg_preview from "@assets/wilgerrusorania.co.za__12_-removebg-preview.png";

export default function Footer() {
  const StormLogo = () => (
    <img 
      src={wilgerrusorania_co_za__12__removebg_preview} 
      alt="Storm Logo" 
      className="w-8 h-8 object-contain"
    />
  );

  return (
    <footer className="glassmorphism mt-16 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
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
                softwarebystorm@gmail.com
              </p>
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                South Africa
              </p>
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
