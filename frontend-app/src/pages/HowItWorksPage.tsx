import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-heading font-extrabold text-4xl text-slate-900">How HomeMate Works</h1>
        <p className="text-slate-600 text-base">
          Our verified platform makes finding a room or roommate simple, secure, and stress-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900">1. Setup Your Profile</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Fill in your budget, location preferences, and lifestyle choices to receive intelligent roommate compatibility scores.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900">2. Explore Verified Listings</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Filter through owner-verified rooms and compatible roommate candidates in top urban centers.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900">3. Connect & Move In</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Send request messages directly on HomeMate, arrange visits, and move into your new home smoothly.
          </p>
        </div>
      </div>

      <div className="text-center pt-6">
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 text-white font-extrabold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
