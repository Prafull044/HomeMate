import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AddEditRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [roomTitle, setRoomTitle] = useState('');
  const [roomType, setRoomType] = useState('Single Room');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [description, setDescription] = useState('');

  const [city, setCity] = useState('Bengaluru');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [state] = useState('Karnataka');

  const [wifi, setWifi] = useState(true);
  const [parking, setParking] = useState(true);
  const [furnished, setFurnished] = useState(true);
  const [kitchen, setKitchen] = useState(true);
  const [attachedBathroom, setAttachedBathroom] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomTitle || !rent || !city) {
      showToast('Please fill in room title, rent, and city', true);
      return;
    }

    setSubmitting(true);
    try {
      await api.createRoom({
        room_title: roomTitle,
        room_type: roomType,
        rent: Number(rent),
        deposit: Number(deposit) || null,
        available_from: availableFrom || null,
        description,
        city,
        area,
        address,
        state,
        facilities: {
          wifi,
          parking,
          furnished,
          kitchen,
          attached_bathroom: attachedBathroom,
        },
        requirements: {
          pets_allowed: petsAllowed,
        },
      });
      showToast('Room listed successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to list room', true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900">Post a New Room Listing</h1>
        <p className="text-slate-500 text-sm mt-1">
          Provide property details, rent, location, and facilities to attract prospective tenants.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
            1. Basic Property Information
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Room / Property Title</label>
            <input
              type="text"
              placeholder="e.g. Spacious Sunlit Single Room in Koramangala"
              value={roomTitle}
              onChange={e => setRoomTitle(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Room Type</label>
              <select
                value={roomType}
                onChange={e => setRoomType(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none bg-white"
              >
                <option value="Single Room">Single Room</option>
                <option value="Shared Room">Shared Room</option>
                <option value="1 BHK">1 BHK Flat</option>
                <option value="2 BHK">2 BHK Flat</option>
                <option value="3 BHK">3 BHK Flat</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Available From</label>
              <input
                type="date"
                value={availableFrom}
                onChange={e => setAvailableFrom(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
            2. Rent & Deposit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                placeholder="e.g. 12000"
                value={rent}
                onChange={e => setRent(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                placeholder="e.g. 30000"
                value={deposit}
                onChange={e => setDeposit(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
            3. Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Area / Locality</label>
              <input
                type="text"
                placeholder="e.g. Indiranagar 100ft Road"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Address</label>
            <input
              type="text"
              placeholder="Building No, Street Name"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-2">
            4. Facilities & Rules
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'WiFi Included', state: wifi, setState: setWifi },
              { label: 'Parking', state: parking, setState: setParking },
              { label: 'Furnished', state: furnished, setState: setFurnished },
              { label: 'Kitchen Access', state: kitchen, setState: setKitchen },
              { label: 'Attached Bath', state: attachedBathroom, setState: setAttachedBathroom },
              { label: 'Pets Allowed', state: petsAllowed, setState: setPetsAllowed },
            ].map(item => (
              <label
                key={item.label}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  item.state ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={e => item.setState(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Room Description</label>
            <textarea
              rows={4}
              placeholder="Describe the room, house rules, nearby amenities..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all"
        >
          {submitting ? 'Publishing Listing...' : 'Publish Room Listing'}
        </button>
      </form>
    </div>
  );
};
