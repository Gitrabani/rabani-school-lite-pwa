
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { AppUser, UserRole } from './types';
import { toast } from '../../hooks/use-toast';

export async function getUserProfileFromSession(session: Session | null): Promise<AppUser | null> {
  if (!session?.user) return null;
  
  try {
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    if (!profileData) {
      console.error('No profile data found');
      return null;
    }

    // Create AppUser object from auth user and profile data
    const appUser: AppUser = {
      id: session.user.id,
      name: profileData.full_name || '',
      email: session.user.email!,
      role: profileData.role as UserRole || 'student',
      profileImage: profileData.avatar_url || undefined
    };

    return appUser;
  } catch (error) {
    console.error('Error processing user session:', error);
    return null;
  }
}

export async function handleSignup(
  email: string, 
  password: string, 
  userData: { fullName: string; role: string }
): Promise<boolean> {
  try {
    // Ensure the role is a valid UserRole
    if (!isValidUserRole(userData.role)) {
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
          full_name: userData.fullName,
          role: userData.role
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

export async function handleLogin(email: string, password: string): Promise<boolean> {
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

export async function handleLogout(): Promise<void> {
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
