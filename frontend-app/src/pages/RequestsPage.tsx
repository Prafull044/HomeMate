import React, { useState, useEffect } from 'react';
import { Check, X, Phone, MessageSquare, User as UserIcon, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { RoomRequest, RoommateRequest } from '../types';
import { UserProfileModal } from '../components/common/UserProfileModal';

export const RequestsPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const [roomRequests, setRoomRequests] = useState<RoomRequest[]>([]);
  const [roommateRequests, setRoommateRequests] = useState<RoommateRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for inspecting any user's profile & preferences
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      setRoomRequests(data.roomRequests || []);
      setRoommateRequests(data.roommateRequests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (type: 'room' | 'roommate', id: string, status: 'Accepted' | 'Rejected') => {
    try {
      await api.updateRequestStatus(type, id, status);
      showToast(`Request ${status.toLowerCase()} successfully!`);
      loadRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to update request', true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Loading requests...</p>
      </div>
    );
  }

  const isOwner = user?.role === 'owner';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900">Manage Requests</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review incoming and sent room inquiries and roommate connection requests.
        </p>
      </div>

      {/* Room Requests Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <h2 className="font-heading font-bold text-xl text-slate-900">Room Inquiries</h2>

        {roomRequests.length > 0 ? (
          <div className="space-y-4">
            {roomRequests.map(req => {
              const otherUserId = isOwner ? req.requester_id : (req as any).owner_user_id;
              const otherUserName = isOwner ? req.requester_name : (req as any).owner_name || 'Owner';
              const otherUserMob = isOwner ? (req as any).requester_mob_num : (req as any).owner_mob_num;
              const isAccepted = req.request_status === 'Accepted';

              return (
                <div
                  key={req.room_request_id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">{req.room_title || 'Room Listing'}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : req.request_status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.request_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold">{isOwner ? 'From Requester:' : 'Property Owner:'}</span>{' '}
                        <button
                          onClick={() => otherUserId && setSelectedUserId(otherUserId)}
                          className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{otherUserName}</span>
                          <Eye className="w-3 h-3 text-indigo-500" />
                        </button>
                      </p>
                      {req.message && <p className="text-xs text-slate-500 italic mt-1">"{req.message}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {otherUserId && (
                        <button
                          onClick={() => setSelectedUserId(otherUserId)}
                          className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <UserIcon className="w-3.5 h-3.5" /> View Profile
                        </button>
                      )}

                      {isOwner && req.request_status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus('room', req.room_request_id, 'Accepted')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('room', req.room_request_id, 'Rejected')}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Accepted Contact Info Banner */}
                  {isAccepted && otherUserMob && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 mt-2">
                      <span className="font-bold flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Accepted Contact Mobile: {otherUserMob}</span>
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={`tel:${otherUserMob}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                        <a
                          href={`https://wa.me/${String(otherUserMob).replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No room requests.</p>
        )}
      </div>

      {/* Roommate Requests Section (for non-owners) */}
      {!isOwner && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <h2 className="font-heading font-bold text-xl text-slate-900">Roommate Connections</h2>

          {roommateRequests.length > 0 ? (
            <div className="space-y-4">
              {roommateRequests.map(req => {
                const isReceiver = req.receiver_id === user?.user_id;
                const otherUserId = isReceiver ? req.sender_id : req.receiver_id;
                const otherUserName = isReceiver ? req.sender_name : req.receiver_name;
                const otherUserMob = isReceiver ? (req as any).sender_mob_num : (req as any).receiver_mob_num;
                const isAccepted = req.request_status === 'Accepted';

                return (
                  <div
                    key={req.roommate_request_id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => otherUserId && setSelectedUserId(otherUserId)}
                            className="font-extrabold text-base text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1"
                          >
                            <span>{otherUserName}</span>
                            <Eye className="w-3.5 h-3.5 text-indigo-500" />
                          </button>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isAccepted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : req.request_status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.request_status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          {isReceiver ? 'Received connection request' : 'Sent connection request'}
                        </p>
                        {req.message && <p className="text-xs text-slate-600 italic">"{req.message}"</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {otherUserId && (
                          <button
                            onClick={() => setSelectedUserId(otherUserId)}
                            className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <UserIcon className="w-3.5 h-3.5" /> View Profile
                          </button>
                        )}

                        {isReceiver && req.request_status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus('roommate', req.roommate_request_id, 'Accepted')}
                              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus('roommate', req.roommate_request_id, 'Rejected')}
                              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <X className="w-4 h-4" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Accepted Mobile Number Banner */}
                    {isAccepted && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900 mt-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Connected Mobile: {otherUserMob || 'Contact info unlocked'}</span>
                        </span>
                        {otherUserMob && (
                          <div className="flex gap-2">
                            <a
                              href={`tel:${otherUserMob}`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> Call
                            </a>
                            <a
                              href={`https://wa.me/${String(otherUserMob).replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No roommate requests.</p>
          )}
        </div>
      )}

      {/* Full User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
