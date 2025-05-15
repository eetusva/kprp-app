import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'kprpuser';

// This interface represents the data we expect from the 'profiles' table
export interface Profile {
  id: string; // Corresponds to auth.users.id
  username: string;
  avatar_url: string;
  role: UserRole;
}

// This interface represents a message, joining message data with profile data
export interface Message {
  id: string;
  content: string;
  user_id: string; // Foreign key to profiles.id
  created_at: string; // ISO timestamp string
  profiles?: Profile; // Optional: Embed profile data if joined
}

// App-specific User type, combining Supabase auth user and our profile
export interface AppUser extends SupabaseUser {
  profile?: Profile; // Contains username, avatar_url, role
}


export interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AppUser | null; // Changed from simple boolean/role to full user object
  userRole: UserRole | null; // Kept for convenience, derived from user.profile.role
  login: (email: string, password: string) => Promise<boolean>; // Email is used for Supabase auth
  logout: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<Profile | null>;
}

export interface MessageContextType {
  messages: Message[];
  users: Profile[]; // Users are now profiles
  addMessage: (content: string, userId: string) => Promise<void>; // Pass userId instead of full User object
  editMessage: (id: string, newContent: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  editUserUsername: (userId: string, newUsername: string) => Promise<void>;
  editUserAvatar: (userId: string, newAvatarUrl: string) => Promise<void>;
  fetchMessages: () => Promise<void>;
  fetchUsers: () => Promise<void>;
}
