import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  Sparkles,
  Clock,
  ArrowRight,
  PlusCircle,
  Star,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardData } from '../types';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded-md w-1/3 animate-pulse" />
        <TableSkeleton />
      </div>
    );
  }

  const isOwner = user?.role === 'owner';
  const pendingRoomReqs = (data?.roomRequests || []).filter(r => r.request_status === 'Pending');
  const pendingRoommateReqs = (data?.roommateRequests || []).filter(r => r.request_status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl">
            Welcome back, {user?.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-200 text-sm">
            {isOwner
              ? 'Manage your listed rooms, review tenant requests, and track reviews.'
              : 'Track room requests, discover roommate matches, and view recommended listings.'}
          </p>
        </div>

        {isOwner ? (
          <Link
            to="/add-room"
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-100 transition-all shrink-0"
          >
            <PlusCircle className="w-5 h-5 text-indigo-600" />
            <span>List New Room</span>
          </Link>
        ) : (
          <Link
            to="/rooms"
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-100 transition-all shrink-0"
          >
            <Building className="w-5 h-5 text-indigo-600" />
            <span>Explore Marketplace</span>
          </Link>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isOwner ? 'Your Listed Rooms' : 'Available Rooms'}
            </p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">
              {data?.rooms?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Requests</p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">
              {pendingRoomReqs.length + pendingRoommateReqs.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isOwner ? 'Tenant Inquiries' : 'Roommate Matches'}
            </p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">
              {isOwner ? data?.roomRequests?.length || 0 : data?.people?.length || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Reviews</p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">
              {data?.reviews?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Action Items & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Room Requests */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-slate-900">Recent Room Requests</h2>
            <Link to="/requests" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Requests →
            </Link>
          </div>

          {(data?.roomRequests || []).length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data!.roomRequests.slice(0, 5).map(req => (
                <div key={req.room_request_id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm text-slate-900">{req.room_title || 'Room Inquiry'}</p>
                    <p className="text-xs text-slate-500">From: {req.requester_name || 'Room Seeker'}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      req.request_status === 'Accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.request_status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.request_status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No room requests found.</p>
          )}
        </div>

        {/* Quick Recommended Properties / Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/profile"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between"
              >
                <span>Edit Profile & Preferences</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link
                to="/requests"
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between"
              >
                <span>Manage Connection Requests</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
