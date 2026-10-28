import type {
  User,
  UserProfile,
  UserPreferences,
  Room,
  DashboardData,
  HomepageData,
  RoommateCandidate,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export const getStoredToken = (): string => localStorage.getItem('homemate_token') || '';
export const setStoredToken = (token: string): void => localStorage.setItem('homemate_token', token);
export const clearStoredToken = (): void => {
  localStorage.removeItem('homemate_token');
  localStorage.removeItem('homemate_user');
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('homemate_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('homemate_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('homemate_user');
  }
};

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = {};

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => '');
    if (text) data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || `Server returned error status ${response.status}`);
  }

  return data as T;
}

export const api = {
  getStats: () => apiFetch<{ total_users: number; available_rooms: number; active_roommate_profiles: number }>('/stats'),
  getHomepageData: () => apiFetch<HomepageData>('/homepage-data'),

  signup: (payload: { name: string; email: string; password: string }) =>
    apiFetch<{ user: User; token: string; needs_onboarding: boolean }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ user: User; token: string; needs_onboarding: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),
  deleteAccount: () => apiFetch<{ message: string }>('/auth/account', { method: 'DELETE' }),

  getMe: () =>
    apiFetch<{
      user: User;
      profile: UserProfile | null;
      preferences: UserPreferences | null;
      roleDetails: any;
    }>('/me'),

  getUserProfile: (userId: string) =>
    apiFetch<{
      user: User & { mob_num?: string; is_connected?: boolean };
      profile: UserProfile | null;
      preferences: UserPreferences | null;
    }>(`/users/${userId}`),

  uploadPhoto: (formData: FormData) =>
    apiFetch<{ profile_image: string }>('/me/photo', {
      method: 'POST',
      body: formData,
    }),

  deletePhoto: () => apiFetch<{ message: string }>('/me/photo', { method: 'DELETE' }),

  onboarding: (payload: {
    role: 'new' | 'existing' | 'owner';
    profile?: Partial<UserProfile & { age?: number; gender?: string; mob_num?: string }>;
    preferences?: Partial<UserPreferences>;
    roleDetails?: Record<string, any>;
  }) =>
    apiFetch<{ user: User; message: string }>('/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProfile: (payload: {
    name?: string;
    age?: number;
    gender?: string;
    mob_num?: string;
    occupation?: string;
    education?: string;
    bio?: string;
  }) =>
    apiFetch<{ message: string }>('/me/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  updatePreferences: (payload: Partial<UserPreferences>) =>
    apiFetch<{ message: string }>('/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getRooms: (filters: {
    location?: string;
    max_budget?: string | number;
    room_type?: string;
    move_in_date?: string;
    verified?: boolean;
    furnished?: boolean;
    pets?: boolean;
    parking?: boolean;
    wifi?: boolean;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return apiFetch<{ rooms: Room[] }>(`/rooms${queryString ? `?${queryString}` : ''}`);
  },

  getRoomDetails: (roomId: string) =>
    apiFetch<{
      room: Room;
      reviews: any[];
      canReview: boolean;
      hasReviewed: boolean;
    }>(`/rooms/${roomId}`),

  createRoom: (payload: any) =>
    apiFetch<{ message: string; room_id: string }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRoom: (roomId: string, payload: any) =>
    apiFetch<{ message: string }>(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteRoom: (roomId: string) =>
    apiFetch<{ message: string }>(`/rooms/${roomId}`, { method: 'DELETE' }),

  getRoommates: () =>
    apiFetch<{ preferencesComplete: boolean; people: RoommateCandidate[] }>('/roommates'),

  getDashboard: () => apiFetch<DashboardData>('/dashboard'),

  sendRoomRequest: (roomId: string, message?: string) =>
    apiFetch<{ message: string }>('/room-requests', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, message }),
    }),

  sendRoommateRequest: (receiverId: string, message?: string) =>
    apiFetch<{ message: string }>('/roommate-requests', {
      method: 'POST',
      body: JSON.stringify({ receiver_id: receiverId, message }),
    }),

  updateRequestStatus: (type: 'room' | 'roommate', id: string, status: 'Accepted' | 'Rejected') =>
    apiFetch<{ message: string }>(`/requests/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  submitReview: (payload: { room_id: string; rating: number; review_text?: string }) =>
    apiFetch<{ message: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
