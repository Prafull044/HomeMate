import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, MapPin, Briefcase, GraduationCap, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Avatar } from './Avatar';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ user: any; profile: any; preferences: any } | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.getUserProfile(userId)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load user profile modal:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  const user = data?.user;
  const profile = data?.profile;
  const preferences = data?.preferences;

  const cleanPhone = (user?.mob_num || '').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading profile details...</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header: Avatar & Main Bio */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar
                src={profile?.profile_image}
                name={user.name}
                gender={user.gender}
                size="xl"
                className="shadow-md"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="font-heading font-extrabold text-2xl text-slate-900">{user.name}</h2>
                  <span title="Verified User">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold capitalize">
                    {user.role === 'owner' ? 'Property Owner' : user.role === 'existing' ? 'Roommate Seeker' : 'Room Seeker'}
                  </span>
                  {user.age && <span className="text-slate-500 font-semibold">{user.age} yrs old</span>}
                  {user.gender && <span className="text-slate-500 font-semibold">• {user.gender}</span>}
                </div>

                {profile?.occupation && (
                  <p className="text-xs font-semibold text-slate-600 flex items-center justify-center sm:justify-start gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{profile.occupation}</span>
                  </p>
                )}
                {profile?.education && (
                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{profile.education}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Direct Contact Card (Shown when Accepted / Connected or Self) */}
            {user.mob_num ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" /> Direct Mobile Contact
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                    Accepted Match
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-sm-center justify-between gap-3">
                  <span className="font-heading font-extrabold text-lg tracking-wide text-slate-900">
                    {user.mob_num}
                  </span>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${user.mob_num}`}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                <span>📱 Mobile Number</span>
                <span className="font-semibold text-slate-400 italic">Visible once connection request is accepted</span>
              </div>
            )}

            {/* About / Bio */}
            {profile?.bio && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">About</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Total Info: Preferences Breakdown */}
            {preferences && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Housing & Lifestyle Preferences</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Location</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      {preferences.preferred_location || 'Flexible'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Budget</span>
                    <span className="font-bold text-emerald-700">
                      {preferences.max_budget ? `Max ₹${Number(preferences.max_budget).toLocaleString()}/mo` : 'Negotiable'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Room Type</span>
                    <span className="font-bold text-slate-800">{preferences.preferred_room_type || 'Any'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Food Preference</span>
                    <span className="font-bold text-slate-800">{preferences.food_preference || 'Flexible'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lifestyle</span>
                    <span className="font-bold text-slate-800">{preferences.lifestyle || 'Standard'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Smoking</span>
                    <span className="font-bold text-slate-800">{preferences.smoking || 'Non-Smoker'}</span>
                  </div>

                  {preferences.caste && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Caste</span>
                      <span className="font-bold text-slate-800">{preferences.caste}</span>
                    </div>
                  )}

                  {preferences.religion && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Religion</span>
                      <span className="font-bold text-slate-800">{preferences.religion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-500 py-8">Unable to load profile information.</p>
        )}
      </div>
    </div>
  );
};
