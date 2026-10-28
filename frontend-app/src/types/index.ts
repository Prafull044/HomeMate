export type UserRole = 'new' | 'existing' | 'owner' | null;

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  age?: number | null;
  gender?: string | null;
  mob_num?: string | null;
}

export interface UserProfile {
  profile_id?: string;
  user_id: string;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  profile_image?: string | null;
}

export interface UserPreferences {
  preference_id?: string;
  user_id: string;
  preferred_location?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  preferred_room_type?: string | null;
  lifestyle?: string | null;
  food_preference?: string | null;
  caste?: string | null;
  religion?: string | null;
  smoking?: string | null;
  move_in_date?: string | null;
}

export interface RoomFacilities {
  facility_id?: string;
  wifi?: boolean | number;
  parking?: boolean | number;
  furnished?: boolean | number;
  kitchen?: boolean | number;
  attached_bathroom?: boolean | number;
  electricity?: boolean | number;
  water_supply?: boolean | number;
}

export interface RoomRequirements {
  requirement_id?: string;
  preferred_gender?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  preferred_occupation?: string | null;
  preferred_caste?: string | null;
  preferred_religion?: string | null;
  smoking_preference?: string | null;
  food_preference?: string | null;
  pets_allowed?: boolean | number;
}

export interface RoomLocation {
  location_id?: string;
  address?: string | null;
  area?: string | null;
  city: string;
  state?: string | null;
  pincode?: string | null;
}

export interface Room {
  room_id: string;
  owner_id?: string;
  owner_name?: string;
  owner_user_id?: string;
  verification_status?: 'Pending' | 'Verified' | string;
  room_title: string;
  room_type: string;
  rent: number;
  deposit?: number | null;
  available_from?: string | null;
  availability_status?: 'Available' | 'Rented' | 'Unavailable' | string;
  description?: string | null;
  created_at?: string;
  city?: string;
  area?: string;
  address?: string;
  state?: string;
  pincode?: string;
  wifi?: boolean | number;
  parking?: boolean | number;
  furnished?: boolean | number;
  kitchen?: boolean | number;
  attached_bathroom?: boolean | number;
  electricity?: boolean | number;
  water_supply?: boolean | number;
  preferred_gender?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  preferred_occupation?: string | null;
  preferred_caste?: string | null;
  preferred_religion?: string | null;
  smoking_preference?: string | null;
  food_preference?: string | null;
  pets_allowed?: boolean | number;
  average_rating?: number;
  review_count?: number;
  images?: string[];
}

export interface RoommateCandidate {
  user_id: string;
  name: string;
  role: UserRole;
  age?: number | null;
  gender?: string | null;
  occupation?: string | null;
  education?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  preferred_location?: string | null;
  min_budget?: number | null;
  max_budget?: number | null;
  preferred_room_type?: string | null;
  lifestyle?: string | null;
  food_preference?: string | null;
  caste?: string | null;
  religion?: string | null;
  smoking?: string | null;
  compatibility?: number | string;
}

export interface RoomRequest {
  room_request_id: string;
  room_id: string;
  room_title?: string;
  requester_id: string;
  requester_name?: string;
  owner_id: string;
  message?: string;
  request_status: 'Pending' | 'Accepted' | 'Rejected';
  request_date?: string;
  has_review?: boolean | number;
}

export interface RoommateRequest {
  roommate_request_id: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  receiver_name?: string;
  message?: string;
  request_status: 'Pending' | 'Accepted' | 'Rejected';
  request_date?: string;
}

export interface Review {
  review_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  owner_id?: string;
  room_id: string;
  room_title?: string;
  rating: number;
  review_text?: string | null;
  review_date?: string;
}

export interface DashboardData {
  role: UserRole;
  profile_image?: string | null;
  rooms: Room[];
  reviews: Review[];
  roomRequests: RoomRequest[];
  roommateRequests: RoommateRequest[];
  people: RoommateCandidate[];
}

export interface HomepageData {
  rooms: Room[];
  people: RoommateCandidate[];
}
