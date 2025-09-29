import { Instagram, Music, MapPin, Phone, Mail, Zap } from 'lucide-react';
import { Button } from './ui/button';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_herbal-memberhub/artifacts/g7wqgiz2_Logo.png" 
                alt="StatusXSmoakland Logo" 
                className="h-10 w-auto"
              />
              <div className="text-2xl font-bold text-white">
                <span className="text-green-400">Status</span>
                <span className="text-yellow-400">X</span>
                <span className="text-green-400">Smoakland</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              NYC's premier members-only cannabis marketplace. Premium products, daily deals, and **PICKUP ONLY** at our exclusive location. Cash accepted in store.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.instagram.com/smoaklandnycbx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-400 transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@smoaklandnycbx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Music className="h-6 w-6" />
              </a>
              <span className="text-gray-500">@smoaklandnycbx</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#deals" className="text-gray-400 hover:text-white transition-colors">
                  Daily Deals
                </a>
              </li>
              <li>
                <a href="#wellness-center" className="text-gray-400 hover:text-white transition-colors">
                  Wellness Center
                </a>
              </li>
              <li>
                <a href="#membership" className="text-gray-400 hover:text-white transition-colors">
                  Membership
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>NYC PICKUP Location - Members Only</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@statusxsmoakland.com</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <span>💰</span>
                <span>Cash Accepted In Store</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Options */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <h3 className="text-white font-semibold mb-4">PICKUP ONLY - Payment Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-400/30">
              <h4 className="text-yellow-400 font-semibold mb-2 flex items-center space-x-2">
                <span>💰</span>
                <span>Cash Payment In Store</span>
              </h4>
              <p className="text-gray-300 text-sm">Pay with cash when you pickup your order. Exact change preferred.</p>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-400/30">
              <h4 className="text-green-400 font-semibold mb-2 flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>In-App Pre-Payment</span>
              </h4>
              <p className="text-gray-300 text-sm">Pre-pay in app for faster pickup service. Still PICKUP ONLY.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 StatusXSmoakland. All rights reserved. • NYC Members Only
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#age-verification" className="text-gray-400 hover:text-white transition-colors">
              Age Verification
            </a>
            <a href="#compliance" className="text-gray-400 hover:text-white transition-colors">
              Legal Compliance
            </a>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-xs text-center">
            This platform is for authorized members only. Must be 21+ years old. Cannabis products have not been evaluated by the FDA. 
            Please consume responsibly and in accordance with local laws. Keep out of reach of children and pets.
          </p>
          <p className="text-gray-500 text-xs text-center mt-2">
            Download "PrimeStatus" from Apple App Store or Google Play Store
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;