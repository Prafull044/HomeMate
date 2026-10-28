import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  IndianRupee,
  Home,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import type { Room, RoommateCandidate } from '../types';
import { PropertyCard } from '../components/cards/PropertyCard';
import { RoommateCard } from '../components/cards/RoommateCard';
import { PropertySkeleton } from '../components/common/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchBudget, setSearchBudget] = useState('');
  const [searchRoomType, setSearchRoomType] = useState('');
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [sampleRoommates, setSampleRoommates] = useState<RoommateCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [hpData] = await Promise.all([
          api.getHomepageData().catch(() => ({ rooms: [], people: [] })),
        ]);
        setFeaturedRooms(hpData.rooms || []);
        setSampleRoommates(hpData.people || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchBudget) params.append('max_budget', searchBudget);
    if (searchRoomType) params.append('room_type', searchRoomType);
    navigate(`/rooms?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden gradient-bg-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>India's #1 Room & Roommate Finder</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1]">
                Find Your Perfect <br />
                <span className="gradient-text">Room & Roommate</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Discover verified flats, comfortable rooms, and compatible roommates matched to your budget, lifestyle, and preferences across top urban cities.
              </p>

              {/* 2. SMART SEARCH BAR */}
              <div className="pt-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white p-3 rounded-2xl sm:rounded-full shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2 max-w-3xl"
                >
                  {/* Location Input */}
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
                    <MapPin className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="flex-1 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Location / City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru, Indiranagar"
                        value={searchLocation}
                        onChange={e => setSearchLocation(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Budget Input */}
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
                    <IndianRupee className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex-1 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Max Monthly Budget
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 12000"
                        value={searchBudget}
                        onChange={e => setSearchBudget(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Room Type Dropdown */}
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 w-full">
                    <Home className="w-5 h-5 text-violet-600 shrink-0" />
                    <div className="flex-1 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Room Type
                      </label>
                      <select
                        value={searchRoomType}
                        onChange={e => setSearchRoomType(e.target.value)}
                        className="w-full text-sm font-semibold text-slate-900 bg-transparent outline-none cursor-pointer"
                      >
                        <option value="">Any Room Type</option>
                        <option value="Single Room">Single Private Room</option>
                        <option value="Shared Room">Shared Room</option>
                        <option value="1 BHK">1 BHK Apartment</option>
                        <option value="2 BHK">2 BHK Flat</option>
                        <option value="3 BHK">3 BHK Flat</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all shrink-0 active:scale-95"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Search</span>
                  </button>
                </form>
              </div>

              {/* Stats Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="font-heading font-extrabold text-2xl text-slate-900">1,500+</p>
                  <p className="text-xs font-semibold text-slate-500">Active Users</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-2xl text-indigo-600">420+</p>
                  <p className="text-xs font-semibold text-slate-500">Verified Rooms</p>
                </div>
                <div>
                  <p className="font-heading font-extrabold text-2xl text-violet-600">98%</p>
                  <p className="text-xs font-semibold text-slate-500">Match Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Right Visual Floating Showcase */}
            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85"
                  alt="Modern Apartment Living"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-xs font-bold backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Owner Listing
                  </div>
                  <h3 className="font-heading font-bold text-xl">Sunny 2 BHK Flat in Indiranagar</h3>
                  <p className="text-xs text-slate-200">₹14,000 / month • WiFi, Parking, Furnished</p>
                </div>
              </div>

              {/* Floating Match Card Badge */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Roommate Match</p>
                  <p className="font-heading font-bold text-slate-900 text-sm">92% Compatibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>Explore Verified Spaces</span>
            </div>
            <h2 className="font-heading font-bold text-3xl text-slate-900">Featured Properties & Rooms</h2>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 group"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PropertySkeleton />
            <PropertySkeleton />
            <PropertySkeleton />
          </div>
        ) : featuredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map(room => (
              <PropertyCard key={room.room_id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-medium">No featured properties currently available.</p>
            <Link to="/rooms" className="mt-3 inline-block text-indigo-600 font-bold text-sm">Browse Marketplace →</Link>
          </div>
        )}
      </section>

      {/* 4. POPULAR LOCATIONS GRID */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="font-heading font-bold text-3xl">Popular Urban Locations</h2>
            <p className="text-slate-400 text-sm">Explore rooms and shared flats in top tech hubs and vibrant neighborhoods across India.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { city: 'Bengaluru', count: '140+ Rooms', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
              { city: 'Mumbai', count: '95+ Rooms', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
              { city: 'Delhi NCR', count: '110+ Rooms', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
              { city: 'Pune', count: '75+ Rooms', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80' },
              { city: 'Hyderabad', count: '85+ Rooms', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80' },
              { city: 'Chennai', count: '50+ Rooms', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80' },
            ].map(loc => (
              <Link
                key={loc.city}
                to={`/rooms?location=${encodeURIComponent(loc.city)}`}
                className="group relative rounded-2xl overflow-hidden h-40 border border-slate-800 shadow-md hover:scale-105 transition-all duration-300"
              >
                <img src={loc.image} alt={loc.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-heading font-bold text-white text-base">{loc.city}</p>
                  <p className="text-[11px] text-indigo-400 font-semibold">{loc.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FIND YOUR ROOMMATE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Smart Compatibility</span>
            </div>
            <h2 className="font-heading font-bold text-3xl text-slate-900">Connect With Compatible Roommates</h2>
          </div>
          <Link
            to="/roommates"
            className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 group"
          >
            <span>Explore Roommate Matches</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {sampleRoommates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleRoommates.map(person => (
              <RoommateCard key={person.user_id} person={person} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-500 font-medium">Log in to view intelligent roommate compatibility scores!</p>
            <Link to="/login" className="mt-2 inline-block text-violet-600 font-bold text-sm">Log In Now →</Link>
          </div>
        )}
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-3">How HomeMate Works</h2>
          <p className="text-slate-600 text-sm">Simple, safe, and transparent steps to land your ideal living situation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Create Your Profile & Preferences',
              desc: 'Set your budget, preferred locations, dietary choices, and lifestyle habits to unlock accurate roommate compatibility scores.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Explore Verified Rooms or Matches',
              desc: 'Browse 100% owner-verified rooms or discover compatible roommates looking for shared housing.',
              icon: Search,
            },
            {
              step: '03',
              title: 'Connect & Move In Comfortably',
              desc: 'Send request messages, schedule visits, and move into your new home with complete peace of mind.',
              icon: CheckCircle2,
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs relative">
                <span className="font-heading font-extrabold text-4xl text-slate-200 absolute top-6 right-6">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. TRUST & SAFETY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" /> Trust & Safety First
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl">Verified Listings & Safe Messaging</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Every owner and room listing goes through verification to protect seekers from scams. Enjoy end-to-end direct requests without spam.
            </p>
          </div>
          <Link
            to="/register"
            className="px-8 py-4 rounded-full bg-white text-indigo-900 font-extrabold text-sm hover:bg-slate-100 transition-all shadow-lg shrink-0"
          >
            Join HomeMate Today
          </Link>
        </div>
      </section>
    </div>
  );
};
