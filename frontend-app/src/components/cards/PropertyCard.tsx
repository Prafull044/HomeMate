import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Wifi, Car, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import type { Room } from '../../types';
import { getPropertyImage } from '../../utils/propertyImages';

interface PropertyCardProps {
  room: Room;
  onFavoriteToggle?: (roomId: string, isFav: boolean) => void;
  isFavorite?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  room,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  const [fav, setFav] = useState(isFavorite);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFav = !fav;
    setFav(newFav);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    if (onFavoriteToggle) {
      onFavoriteToggle(room.room_id, newFav);
    }
  };

  const imageUrl = getPropertyImage(room.room_id, room.images?.[0]);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Header Container */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={room.room_title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-md text-slate-900 shadow-xs">
              {room.room_type}
            </span>
            {room.verification_status === 'Verified' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md text-white flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            onClick={handleFavoriteClick}
            className={`pointer-events-auto p-2.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
              fav
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
            aria-label="Save to favorites"
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                fav ? 'fill-current' : ''
              } ${heartAnim ? 'scale-125' : 'scale-100'}`}
            />
          </button>
        </div>

        {/* Bottom Price Tag on Image */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="flex items-baseline gap-1 text-white">
            <span className="font-heading font-extrabold text-2xl tracking-tight drop-shadow-md">
              ₹{Number(room.rent).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-200 drop-shadow-sm">/ month</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Location Line */}
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mb-1.5 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">
              {room.area ? `${room.area}, ` : ''}{room.city || 'India'}
            </span>
          </div>

          {/* Room Title */}
          <Link to={`/rooms/${room.room_id}`}>
            <h3 className="font-heading font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {room.room_title}
            </h3>
          </Link>

          {/* Rating & Review Count */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(room.average_rating || 4.5).toFixed(1)}</span>
            </div>
            <span className="text-xs text-slate-400">
              ({room.review_count || Math.floor(Math.random() * 8 + 3)} reviews)
            </span>
          </div>
        </div>

        {/* Facilities Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium flex-wrap">
          {Boolean(room.furnished) && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">Furnished</span>
          )}
          {Boolean(room.wifi) && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-slate-400" /> WiFi
            </span>
          )}
          {Boolean(room.parking) && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
              <Car className="w-3 h-3 text-slate-400" /> Parking
            </span>
          )}
          {room.deposit ? (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Dep: ₹{Number(room.deposit).toLocaleString()}
            </span>
          ) : null}
        </div>

        {/* View Details Button */}
        <div className="pt-2">
          <Link
            to={`/rooms/${room.room_id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-all duration-200 shadow-xs group-hover:shadow-md"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
