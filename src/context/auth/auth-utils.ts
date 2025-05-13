import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { AppUser, UserRole } from './types';
import { toast } from '../../hooks/use-toast';

export const getUserProfileFromSession = async (session: Session | null) => {
  if (!session) return null;

  try {
    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!profile) {
      console.error('No profile found for user');
      return null;
    }

    // Return AppUser object
    return {
      id: session.user.id,
      name: profile.full_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || '',
      role: profile.role as UserRole,
      profileImage: profile.avatar_url || undefined
    };
  } catch (error) {
    console.error('Error in getUserProfileFromSession:', error);
    return null;
  }
};

export async function handleSignup(
  email: string, 
  password: string, 
  fullName: string,
  role: string,
  onSuccess?: () => void
): Promise<boolean> {
  try {
    // Ensure the role is a valid UserRole
    if (!isValidUserRole(role)) {
      toast({
        title: 'Invalid role',
        description: 'The provided user role is not valid',
        variant: 'destructive'
      });
      return false;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }

    toast({
      title: 'Signup successful',
      description: 'Your account has been created. You can now log in.',
    });

    return true;
  } catch (error: any) {
    toast({
      title: 'Signup error',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

// Helper function to validate if a string is a valid UserRole
function isValidUserRole(role: string): role is UserRole {
  return ['admin', 'teacher', 'student', 'parent'].includes(role);
}

export async function handleLogin(
  email: string, 
  password: string,
  onSuccess?: (user: AppUser) => void
): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }

    // The user state will be updated by the auth state change event
    return true;
  } catch (error: any) {
    toast({
      title: 'Login error',
      description: error.message,
      variant: 'destructive'
    });
    return false;
  }
}

export async function handleLogout(onSuccess?: () => void) {
  try {
    // Check if user is already logged out
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session found during logout');
      // User is already logged out
      toast({
        title: 'Already logged out',
        description: 'You were already logged out of the system.',
      });
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout error',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  } catch (error: any) {
    console.error('Unexpected logout error:', error);
    toast({
      title: 'Logout error',
      description: error.message || 'An unexpected error occurred during logout',
      variant: 'destructive'
    });
  }
}
