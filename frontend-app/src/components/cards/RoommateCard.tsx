import React from 'react';
import { MapPin, Briefcase, Sparkles, MessageSquare, UserCheck } from 'lucide-react';
import type { RoommateCandidate } from '../../types';
import { Avatar } from '../common/Avatar';

interface RoommateCardProps {
  person: RoommateCandidate;
  onConnect?: (person: RoommateCandidate) => void;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({ person, onConnect }) => {
  const compScore = typeof person.compatibility === 'number'
    ? person.compatibility
    : parseInt(String(person.compatibility || '80'), 10) || 80;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
      {/* Compatibility Badge Banner */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-violet-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-300" />
        <span>{compScore}% Match</span>
      </div>

      <div>
        {/* Header Avatar & Info */}
        <div className="flex items-start gap-4 mb-4 pr-16">
          <Avatar
            src={person.profile_image}
            name={person.name}
            gender={person.gender}
            size="lg"
            className="ring-2 ring-indigo-50 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-bold text-lg text-slate-900 leading-snug">
                {person.name}
              </h3>
              <span title="Verified User">
                <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              </span>
            </div>
            {person.occupation && (
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{person.occupation}</span>
              </p>
            )}
            {person.preferred_location && (
              <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Looking in {person.preferred_location}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bio Snippet */}
        {person.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            "{person.bio}"
          </p>
        )}

        {/* Preferences Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Budget Range
            </span>
            <span className="font-bold text-slate-900">
              {person.max_budget ? `Up to ₹${Number(person.max_budget).toLocaleString()}` : 'Negotiable'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Preference
            </span>
            <span className="font-bold text-indigo-600">
              {person.preferred_room_type || 'Shared Room'}
            </span>
          </div>
        </div>

        {/* Preference Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {person.food_preference && (
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
              {person.food_preference}
            </span>
          )}
          {person.lifestyle && (
            <span className="px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold border border-violet-200/60">
              {person.lifestyle}
            </span>
          )}
          {person.smoking && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/60">
              {person.smoking}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onConnect && onConnect(person)}
          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-500/20 active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Connect Request</span>
        </button>
      </div>
    </div>
  );
};
