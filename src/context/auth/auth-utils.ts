
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { AppUser, UserRole } from './types';

/**
 * Extracts user profile data from a Supabase session
 */
export const getUserProfileFromSession = async (session: Session | null): Promise<AppUser | null> => {
  if (!session) return null;

  try {
    // Get user profile data from the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      role: profile?.role || 'student', // Default to student if role not found
      fullName: profile?.full_name || '',
      avatarUrl: profile?.avatar_url || null,
      isAuthenticated: true
    };
  } catch (error) {
    console.error('Error in getUserProfileFromSession:', error);
    return null;
  }
};

/**
 * Handles user login
 */
export const handleLogin = async (email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in handleLogin:', error);
    return false;
  }
};

/**
 * Handles user signup
 */
export const handleSignup = async (
  email: string, 
  password: string, 
  fullName: string, 
  role: UserRole
): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in handleSignup:', error);
    return false;
  }
};

/**
 * Handles user logout
 */
export const handleLogout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
  } catch (error) {
    console.error('Error in handleLogout:', error);
  }
};
