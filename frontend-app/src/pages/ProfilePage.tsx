import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ShieldCheck,
  Camera,
  Edit2,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Avatar } from '../components/common/Avatar';

export const ProfilePage: React.FC = () => {
  const { user, profile, preferences, showToast, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  // Edit Profile Form State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState<number | string>(user?.age || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [mobNum, setMobNum] = useState(user?.mob_num || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Preferences Form State
  const [preferredLocation, setPreferredLocation] = useState(preferences?.preferred_location || '');
  const [minBudget, setMinBudget] = useState<number | string>(preferences?.min_budget || '');
  const [maxBudget, setMaxBudget] = useState<number | string>(preferences?.max_budget || '');
  const [preferredRoomType, setPreferredRoomType] = useState(preferences?.preferred_room_type || 'Single Room');
  const [lifestyle, setLifestyle] = useState(preferences?.lifestyle || 'Early Bird');
  const [foodPreference, setFoodPreference] = useState(preferences?.food_preference || 'Flexible');
  const [caste, setCaste] = useState(preferences?.caste || '');
  const [religion, setReligion] = useState(preferences?.religion || '');
  const [smoking, setSmoking] = useState(preferences?.smoking || 'Non-Smoker');
  const [savingPref, setSavingPref] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(user.age || '');
      setGender(user.gender || 'Male');
      setMobNum(user.mob_num || '');
    }
    if (profile) {
      setOccupation(profile.occupation || '');
      setEducation(profile.education || '');
      setBio(profile.bio || '');
    }
    if (preferences) {
      setPreferredLocation(preferences.preferred_location || '');
      setMinBudget(preferences.min_budget || '');
      setMaxBudget(preferences.max_budget || '');
      setPreferredRoomType(preferences.preferred_room_type || 'Single Room');
      setLifestyle(preferences.lifestyle || 'Early Bird');
      setFoodPreference(preferences.food_preference || 'Flexible');
      setCaste(preferences.caste || '');
      setReligion(preferences.religion || '');
      setSmoking(preferences.smoking || 'Non-Smoker');
    }
  }, [user, profile, preferences]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile({
        name,
        age: Number(age) || undefined,
        gender,
        mob_num: mobNum,
        occupation,
        education,
        bio,
      });
      showToast('Profile updated successfully!');
      setEditModalOpen(false);
      refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', true);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePrefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPref(true);
    try {
      await api.updatePreferences({
        preferred_location: preferredLocation,
        min_budget: Number(minBudget) || null,
        max_budget: Number(maxBudget) || null,
        preferred_room_type: preferredRoomType,
        lifestyle,
        food_preference: foodPreference,
        caste,
        religion,
        smoking,
      });
      showToast('Housing preferences updated!');
      refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', true);
    } finally {
      setSavingPref(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);

    try {
      await api.uploadPhoto(formData);
      showToast('Profile photo updated!');
      refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', true);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await api.deletePhoto();
      showToast('Profile photo removed. Switched to SVG illustrated avatar.');
      refreshUserData();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove photo', true);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-slate-500 font-semibold">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* MODERN COMPACT PROFILE HEADER (NO LinkedIn Banner) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with Camera Overlay Button */}
        <div className="relative group shrink-0">
          <Avatar
            src={profile?.profile_image}
            name={user.name}
            gender={user.gender}
            size="2xl"
            className="shadow-md"
          />
          <label className="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 text-white shadow-md cursor-pointer hover:bg-indigo-700 transition-transform active:scale-90">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* User Info Line */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">{user.name}</h1>
                <span title="Verified User">
                  <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {profile?.occupation || 'HomeMate Member'} • {user.gender || 'Not specified'}, {user.age ? `${user.age} yrs` : ''}
              </p>
            </div>

            <button
              onClick={() => setEditModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors self-center sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>

          {/* User Role & Badges */}
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold capitalize">
              {user.role === 'owner' ? 'Property Owner' : user.role === 'existing' ? 'Roommate Seeker' : 'Room Seeker'}
            </span>
            {preferences?.preferred_location && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {preferences.preferred_location}
              </span>
            )}
            {preferences?.max_budget && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                Max ₹{Number(preferences.max_budget).toLocaleString()}/mo
              </span>
            )}
            {profile?.profile_image && (
              <button
                onClick={handleRemovePhoto}
                className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 ml-2"
              >
                <Trash2 className="w-3 h-3" /> Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-heading font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Personal Information
        </button>
        {user.role !== 'owner' && (
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 font-heading font-bold text-sm border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Housing Preferences
          </button>
        )}
      </div>

      {/* Tab Content 1: Personal Info */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">About Me</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {profile?.bio || 'No bio added yet. Click Edit Profile to introduce yourself to prospective roommates or property owners.'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-semibold text-xs uppercase">Email</span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-semibold text-xs uppercase">Mobile</span>
                <span className="font-bold text-slate-900">{user.mob_num || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-semibold text-xs uppercase">Education</span>
                <span className="font-bold text-slate-900">{profile?.education || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-semibold text-xs uppercase">Verification</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1 text-xs">
                  <ShieldCheck className="w-4 h-4" /> Verified User
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Housing Preferences */}
      {activeTab === 'preferences' && user.role !== 'owner' && (
        <form onSubmit={handlePrefSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <h3 className="font-heading font-bold text-xl text-slate-900">Housing & Lifestyle Preferences</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Preferred Location</label>
              <input
                type="text"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={preferredLocation}
                onChange={e => setPreferredLocation(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Max Monthly Budget (₹)</label>
              <input
                type="number"
                placeholder="e.g. 15000"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Room Preference</label>
              <select
                value={preferredRoomType}
                onChange={e => setPreferredRoomType(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Single Room">Single Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="1 BHK">1 BHK Flat</option>
                <option value="2 BHK">2 BHK Flat</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Food Preference</label>
              <select
                value={foodPreference}
                onChange={e => setFoodPreference(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Lifestyle Habits</label>
              <select
                value={lifestyle}
                onChange={e => setLifestyle(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Early Bird">Early Bird</option>
                <option value="Night Owl">Night Owl</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Smoking</label>
              <select
                value={smoking}
                onChange={e => setSmoking(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Non-Smoker">Non-Smoker</option>
                <option value="Occasional">Occasional</option>
                <option value="Smoker">Smoker</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPref}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
          >
            {savingPref ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      )}

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading font-bold text-xl text-slate-900">Edit Personal Profile</h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={mobNum}
                  onChange={e => setMobNum(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer at Tech Corp"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Education</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science, COEP Pune"
                  value={education}
                  onChange={e => setEducation(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
