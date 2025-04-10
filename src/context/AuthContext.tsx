
import React from 'react';
import { AuthProvider as AuthProviderOriginal, useAuth as useAuthOriginal } from './auth/AuthProvider';

// Create a proper functional component wrapper
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthProviderOriginal>{children}</AuthProviderOriginal>;
};

// Re-export the useAuth hook
const useAuth = useAuthOriginal;

export { AuthProvider, useAuth };
