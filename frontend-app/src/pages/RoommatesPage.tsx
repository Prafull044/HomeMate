import React, { useState, useEffect } from 'react';
import { Sparkles, Search, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { RoommateCandidate } from '../types';
import { RoommateCard } from '../components/cards/RoommateCard';
import { RoommateSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const RoommatesPage: React.FC = () => {
  const [candidates, setCandidates] = useState<RoommateCandidate[]>([]);
  const [preferencesComplete, setPreferencesComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [maxBudget, setMaxBudget] = useState('');

  // Request modal state
  const [selectedCandidate, setSelectedCandidate] = useState<RoommateCandidate | null>(null);
  const [requestText, setRequestText] = useState('Hi! I saw your roommate profile on HomeMate and would love to connect.');
  const [sending, setSending] = useState(false);

  const fetchRoommates = async () => {
    setLoading(true);
    try {
      const data = await api.getRoommates();
      setPreferencesComplete(data.preferencesComplete);
      setCandidates(data.people || []);
    } catch (err: any) {
      console.error('Failed to fetch roommates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoommates();
  }, []);

  const handleSendConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    setSending(true);
    try {
      await api.sendRoommateRequest(selectedCandidate.user_id, requestText);
      setSelectedCandidate(null);
    } catch (err: any) {
      console.error('Failed to send request', err);
    } finally {
      setSending(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const query = searchTerm.toLowerCase().trim();
    const nameMatch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      (c.preferred_location || '').toLowerCase().includes(query) ||
      (c.occupation || '').toLowerCase().includes(query) ||
      (c.bio || '').toLowerCase().includes(query);

    const numericMaxBudget = Number(maxBudget);
    const budgetMatch =
      !maxBudget ||
      isNaN(numericMaxBudget) ||
      numericMaxBudget <= 0 ||
      (c.max_budget && Number(c.max_budget) <= numericMaxBudget) ||
      (c.min_budget && Number(c.min_budget) <= numericMaxBudget);

    return nameMatch && budgetMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Roommate Matching</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-slate-900">Find Your Roommate</h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover compatible roommates scored by budget, dietary preference, and lifestyle alignment.
          </p>
        </div>
      </div>

      {/* Incomplete Preferences Banner */}
      {!preferencesComplete && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <p className="font-bold text-sm text-amber-900">Complete Your Preferences to Unlock 100% Matches</p>
            <p className="text-amber-800">
              Please complete your housing and lifestyle preferences in your profile to view compatibility matches.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by name or preferred location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
          />
        </div>
        <div className="w-full sm:w-64">
          <input
            type="number"
            placeholder="Max Budget (₹)..."
            value={maxBudget}
            onChange={e => setMaxBudget(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <RoommateSkeleton />
          <RoommateSkeleton />
          <RoommateSkeleton />
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(person => (
            <RoommateCard
              key={person.user_id}
              person={person}
              onConnect={c => setSelectedCandidate(c)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No roommate matches found"
          description="Try broadening your search parameters or location preferences."
        />
      )}

      {/* Connect Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Connect with {selectedCandidate.name}
            </h3>
            <form onSubmit={handleSendConnection} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Introduce Yourself
                </label>
                <textarea
                  rows={4}
                  value={requestText}
                  onChange={e => setRequestText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-700"
                >
                  {sending ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
