
import * as React from 'react';
import { createContext, useContext, useState, useEffect, FC } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { UserRole } from '../../types';
import { AppUser, AuthContextType } from './types';
import { getUserProfileFromSession, handleLogin, handleSignup, handleLogout } from './auth-utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
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
    const appUser = await getUserProfileFromSession(session);
    setUser(appUser);
    setIsAuthenticated(!!appUser);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    return handleLogin(email, password);
  };

  const signup = async (
    email: string, 
    password: string, 
    userData: { fullName: string; role: UserRole }
  ): Promise<boolean> => {
    return handleSignup(email, password, userData.fullName, userData.role);
  };

  const logout = async () => {
    await handleLogout();
    // Manually clear the state to ensure UI updates immediately
    setUser(null);
    setIsAuthenticated(false);
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
