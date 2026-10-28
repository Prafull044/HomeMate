import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Users,
  LayoutDashboard,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  Building,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from './Avatar';

export const Navbar: React.FC = () => {
  const { user, profile, logoutSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logoutSession();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = user
    ? user.role === 'owner'
      ? [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/owner-rooms', label: 'Manage Rooms', icon: Building },
          { path: '/requests', label: 'Requests', icon: MessageSquare },
          { path: '/profile', label: 'Profile', icon: UserIcon },
        ]
      : user.role === 'existing'
      ? [
          { path: '/roommates', label: 'Find Roommate', icon: Users },
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/requests', label: 'Requests', icon: MessageSquare },
          { path: '/profile', label: 'Profile', icon: UserIcon },
        ]
      : [
          { path: '/rooms', label: 'Find Room', icon: Search },
          { path: '/roommates', label: 'Find Roommate', icon: Users },
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/requests', label: 'Requests', icon: MessageSquare },
          { path: '/profile', label: 'Profile', icon: UserIcon },
        ]
    : [
        { path: '/', label: 'Home', icon: Home },
        { path: '/rooms', label: 'Explore Rooms', icon: Search },
        { path: '/how-it-works', label: 'How It Works', icon: ShieldCheck },
        { path: '/about', label: 'About Us', icon: Users },
      ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              Home<span className="gradient-text">Mate</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Live & Connect
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Avatar
                  src={profile?.profile_image}
                  name={user.name}
                  gender={user.gender}
                  size="sm"
                />
                <span className="text-sm font-semibold text-slate-800 max-w-[120px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 mr-1" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-700 capitalize">
                      {user.role === 'owner' ? 'Property Owner' : user.role === 'existing' ? 'Roommate Seeker' : 'Room Seeker'}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </Link>
                    {user.role === 'owner' && (
                      <Link
                        to="/add-room"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>Post New Room</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 hover:shadow-md transition-all active:scale-[0.98]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-lg px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
              <Avatar src={profile?.profile_image} name={user.name} gender={user.gender} size="md" />
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          )}

          {navLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {!user ? (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-rose-600 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
