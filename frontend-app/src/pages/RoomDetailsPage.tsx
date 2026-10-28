import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Star,
  Wifi,
  Car,
  Utensils,
  Droplet,
  CheckCircle2,
  MessageSquare,
  UserCheck,
  ChevronLeft,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Room } from '../types';
import { getPropertyImage } from '../utils/propertyImages';
import { Avatar } from '../components/common/Avatar';

export const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, showToast } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  // Request Drawer & Review Modal state
  const [requestMsgOpen, setRequestMsgOpen] = useState(false);
  const [requestText, setRequestText] = useState('I am interested in viewing this property.');
  const [submittingReq, setSubmittingReq] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadRoom = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getRoomDetails(id);
      setRoom(data.room);
      setReviews(data.reviews || []);
      setCanReview(data.canReview);
    } catch (err: any) {
      showToast(err.message || 'Failed to load property details', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReq(true);
    try {
      await api.sendRoomRequest(id, requestText);
      showToast('Room inquiry request sent successfully!');
      setRequestMsgOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to send room request', true);
    } finally {
      setSubmittingReq(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    try {
      await api.submitReview({
        room_id: id,
        rating: reviewRating,
        review_text: reviewText,
      });
      showToast('Review published successfully!');
      setReviewModalOpen(false);
      loadRoom();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', true);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-heading font-bold text-2xl text-slate-900">Property Not Found</h2>
        <p className="text-slate-500 text-sm">The property listing you are looking for may have been rented or removed.</p>
        <Link to="/rooms" className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const mainImage = getPropertyImage(room.room_id, room.images?.[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link to="/rooms" className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-indigo-600">
        <ChevronLeft className="w-4 h-4" /> Back to Rooms
      </Link>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-md border border-slate-200/80">
        <div className="md:col-span-2 h-80 sm:h-96 bg-slate-100 relative">
          <img src={mainImage} alt={room.room_title} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-slate-900">
              {room.room_type}
            </span>
            {room.verification_status === 'Verified' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-rows-2 gap-4 h-80 sm:h-96 hidden md:grid">
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
            alt="Interior view"
            className="w-full h-full object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"
            alt="Flat details"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Two Column Layout (Details vs Sticky Booking Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Details Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{room.area ? `${room.area}, ` : ''}{room.city}</span>
                </p>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
                  {room.room_title}
                </h1>
              </div>
              <div className="text-right">
                <p className="font-heading font-extrabold text-3xl text-indigo-600">
                  ₹{Number(room.rent).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 font-semibold">per month</p>
              </div>
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Room Type</span>
                <span className="text-sm font-bold text-slate-900">{room.room_type}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Security Deposit</span>
                <span className="text-sm font-bold text-slate-900">
                  {room.deposit ? `₹${Number(room.deposit).toLocaleString()}` : 'Ask owner'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Available From</span>
                <span className="text-sm font-bold text-slate-900">
                  {room.available_from ? new Date(room.available_from).toLocaleDateString('en-IN') : 'Immediate'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Rating</span>
                <span className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {Number(room.average_rating || 4.5).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4">
              <h3 className="font-heading font-bold text-base text-slate-900 mb-2">About This Property</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {room.description || 'Spacious, well-ventilated room located in a prime residential locality. Close to public transit, supermarkets, and tech parks.'}
              </p>
            </div>

            {/* Facilities */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-heading font-bold text-base text-slate-900 mb-3">Included Facilities & Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'High Speed WiFi', value: room.wifi, icon: Wifi },
                  { label: 'Vehicle Parking', value: room.parking, icon: Car },
                  { label: 'Furnished', value: room.furnished, icon: CheckCircle2 },
                  { label: 'Modular Kitchen', value: room.kitchen, icon: Utensils },
                  { label: 'Attached Washroom', value: room.attached_bathroom, icon: CheckCircle2 },
                  { label: '24/7 Water Supply', value: room.water_supply, icon: Droplet },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={f.label}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
                        f.value
                          ? 'bg-emerald-50/60 border-emerald-200/70 text-emerald-900'
                          : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${f.value ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{f.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Owner Profile Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={room.owner_name || 'Property Owner'} size="lg" />
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Property Owner</p>
                <h4 className="font-heading font-bold text-lg text-slate-900">{room.owner_name}</h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Identity & Document Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-xl text-slate-900">Tenant Reviews</h3>
                <p className="text-xs text-slate-500">Feedback from verified occupants</p>
              </div>

              {canReview && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
                >
                  Write a Review
                </button>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.review_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={rev.reviewer_name} size="xs" />
                        <span className="text-sm font-bold text-slate-900">{rev.reviewer_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    {rev.review_text && <p className="text-xs text-slate-600 italic">"{rev.review_text}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No reviews yet for this room.</p>
            )}
          </div>
        </div>

        {/* Sticky Sidebar Inquiry Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Rent</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-heading font-extrabold text-3xl text-slate-900">
                  ₹{Number(room.rent).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500">/ month</span>
              </div>
            </div>

            {user?.role === 'owner' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold text-center">
                You are viewing this listing as a Property Owner.
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => setRequestMsgOpen(!requestMsgOpen)}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Inquiry Request</span>
                </button>

                {requestMsgOpen && (
                  <form onSubmit={handleSendRequest} className="pt-2 space-y-3 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Message for Owner
                    </label>
                    <textarea
                      rows={3}
                      value={requestText}
                      onChange={e => setRequestText(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
                    />
                    <button
                      type="submit"
                      disabled={submittingReq}
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800"
                    >
                      {submittingReq ? 'Sending...' : 'Confirm & Send Request'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-slate-900">Review Room</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-2 text-amber-400"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Your Review</label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your stay experience..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                {submittingReview ? 'Publishing...' : 'Publish Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
