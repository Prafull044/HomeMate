import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  MapPin,
  IndianRupee,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import type { Room } from '../types';
import { PropertyCard } from '../components/cards/PropertyCard';
import { PropertySkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const RoomsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('max_budget') || '');
  const [roomType, setRoomType] = useState(searchParams.get('room_type') || '');
  const [moveInDate, setMoveInDate] = useState(searchParams.get('move_in_date') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [furnished, setFurnished] = useState(searchParams.get('furnished') === 'true');
  const [pets, setPets] = useState(searchParams.get('pets') === 'true');
  const [parking, setParking] = useState(searchParams.get('parking') === 'true');
  const [wifi, setWifi] = useState(searchParams.get('wifi') === 'true');

  const [sortOption, setSortOption] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await api.getRooms({
        location,
        max_budget: maxBudget,
        room_type: roomType,
        move_in_date: moveInDate,
        verified: verifiedOnly,
        furnished,
        pets,
        parking,
        wifi,
      });
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [searchParams, sortOption]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams();
    if (location) newParams.append('location', location);
    if (maxBudget) newParams.append('max_budget', maxBudget);
    if (roomType) newParams.append('room_type', roomType);
    if (moveInDate) newParams.append('move_in_date', moveInDate);
    if (verifiedOnly) newParams.append('verified', 'true');
    if (furnished) newParams.append('furnished', 'true');
    if (pets) newParams.append('pets', 'true');
    if (parking) newParams.append('parking', 'true');
    if (wifi) newParams.append('wifi', 'true');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setLocation('');
    setMaxBudget('');
    setRoomType('');
    setMoveInDate('');
    setVerifiedOnly(false);
    setFurnished(false);
    setPets(false);
    setParking(false);
    setWifi(false);
    setSearchParams(new URLSearchParams());
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    if (sortOption === 'price-low') return a.rent - b.rent;
    if (sortOption === 'price-high') return b.rent - a.rent;
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900">Explore Rooms & Flats</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse verified listings, filter by budget, and contact property owners directly.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 outline-none cursor-pointer shadow-xs"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                <h3 className="font-heading font-bold text-slate-900 text-base">Filter Search</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-5">
              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Location / Area
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Pune"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* Max Budget Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Max Monthly Rent (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={maxBudget}
                    onChange={e => setMaxBudget(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Property / Room Type
                </label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors cursor-pointer bg-white"
                >
                  <option value="">All Types</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Shared Room">Shared Room</option>
                  <option value="1 BHK">1 BHK Apartment</option>
                  <option value="2 BHK">2 BHK Flat</option>
                  <option value="3 BHK">3 BHK Flat</option>
                </select>
              </div>

              {/* Checkbox Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Amenities & Verification
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={e => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Verified Owners Only</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={furnished}
                    onChange={e => setFurnished(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Furnished Only</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifi}
                    onChange={e => setWifi(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>WiFi Included</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={parking}
                    onChange={e => setParking(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Parking Available</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pets}
                    onChange={e => setPets(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Pet Friendly</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </aside>

        {/* MARKETPLACE PROPERTY GRID */}
        <main className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertySkeleton />
              <PropertySkeleton />
              <PropertySkeleton />
              <PropertySkeleton />
              <PropertySkeleton />
              <PropertySkeleton />
            </div>
          ) : sortedRooms.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-500">
                Showing <span className="font-bold text-slate-900">{sortedRooms.length}</span> available properties
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRooms.map(room => (
                  <PropertyCard key={room.room_id} room={room} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No properties match your filters"
              description="Try adjusting your budget, location, or amenity options to discover more available rooms."
              actionText="Reset Filters"
              onActionClick={handleResetFilters}
            />
          )}
        </main>
      </div>
    </div>
  );
};
