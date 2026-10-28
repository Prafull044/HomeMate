import React from 'react';
import { ShieldCheck, Heart, Users } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-heading font-extrabold text-4xl text-slate-900">About HomeMate</h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto">
          Reimagining urban co-living through trust, transparency, and intelligent community connections.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm">
        <h2 className="font-heading font-bold text-2xl text-slate-900">Our Mission</h2>
        <p>
          HomeMate was created to solve the stress of finding compatible housing and roommates in rapidly growing urban centers. By bringing together verified room listings, owner credentials, and data-driven roommate compatibility scoring, we empower young professionals and students to find living spaces where they truly feel at home.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
            <ShieldCheck className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Verified Owners</h4>
            <p className="text-xs text-slate-500 mt-1">Inspected properties & verified host profiles.</p>
          </div>

          <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 text-center">
            <Users className="w-6 h-6 text-violet-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Smart Compatibility</h4>
            <p className="text-xs text-slate-500 mt-1">Lifestyle & dietary alignment scoring.</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
            <Heart className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm">Zero Brokerage</h4>
            <p className="text-xs text-slate-500 mt-1">Direct requests between seekers & hosts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
