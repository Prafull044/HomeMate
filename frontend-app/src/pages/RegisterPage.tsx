import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, User, Eye, EyeOff, ArrowRight, Building, Users, Search } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginSession, showToast } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'new' | 'existing' | 'owner'>('new');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      // Signup
      const res = await api.signup({ name, email, password });
      loginSession(res.token, res.user);

      // Onboarding Role Setup
      await api.onboarding({
        role,
        profile: {},
        preferences: {},
      });

      showToast('Welcome to HomeMate! Account created successfully.');
      navigate('/profile');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Home className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-slate-900">
              Home<span className="gradient-text">Mate</span>
            </span>
          </Link>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900">Create Your Account</h2>
          <p className="text-slate-500 text-xs">Join India's leading room & roommate matching network</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          {/* Role Choice Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">I am joining as:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'new', label: 'Room Seeker', icon: Search },
                { id: 'existing', label: 'Roommate Seeker', icon: Users },
                { id: 'owner', label: 'Property Owner', icon: Building },
              ].map(r => {
                const Icon = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 font-medium hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{submitting ? 'Creating Account...' : 'Get Started Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
