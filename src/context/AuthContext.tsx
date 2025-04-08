
import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User as AppUser, UserRole } from '../types';
import { toast } from '../hooks/use-toast';
import { Database } from '../integrations/supabase/types';

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData: { fullName: string, role: UserRole }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
      setIsLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        handleSessionChange(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSessionChange = async (session: Session | null) => {
    if (session?.user) {
      try {
        // Get user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        if (!profileData) {
          console.error('No profile data found');
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        // Create AppUser object from auth user and profile data
        const appUser: AppUser = {
          id: session.user.id,
          name: profileData.full_name || '',
          email: session.user.email!,
          role: (profileData.role as UserRole) || 'student',
          profileImage: profileData.avatar_url || undefined
        };

        setUser(appUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error processing user session:', error);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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
  };

  const signup = async (
    email: string, 
    password: string, 
    userData: { fullName: string; role: UserRole }
  ): Promise<boolean> => {
    try {
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
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Logout error',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        // Manually clear the state to ensure UI updates immediately
        setUser(null);
        setIsAuthenticated(false);
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
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup, 
        logout, 
        isAuthenticated, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
