import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldCheck, Heart, MapPin, Mail, Phone, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Home className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
                Home<span className="text-indigo-400">Mate</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              HomeMate is India's leading roommate matching and verified property discovery platform built for modern living, trust, and vibrant community.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Verified Listings</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-indigo-400 border border-slate-700">
                <Lock className="w-4 h-4" />
                <span>Smart Compatibility</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-indigo-400">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/rooms" className="hover:text-white transition-colors">
                  Find Rooms & Flats
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-white transition-colors">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How HomeMate Works
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Post Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-indigo-400">
              Popular Cities
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link to="/rooms?location=Bengaluru" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bengaluru</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms?location=Mumbai" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mumbai</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms?location=Delhi" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Delhi NCR</span>
                </Link>
              </li>
              <li>
                <Link to="/rooms?location=Pune" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pune</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-heading font-bold text-white text-base mb-4 tracking-wide uppercase text-xs text-indigo-400">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>support@homemate.com</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+91 1800-HOMEMATE</span>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Trust & Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HomeMate Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
