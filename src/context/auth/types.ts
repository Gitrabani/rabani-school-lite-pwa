
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: { fullName: string, role: UserRole }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}
