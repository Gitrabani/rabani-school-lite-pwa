
import React from 'react';
import { AuthProvider as AuthProviderOriginal, useAuth as useAuthOriginal } from './auth/AuthProvider';

// Proper re-exporting to ensure React context works correctly
export const AuthProvider = AuthProviderOriginal;
export const useAuth = useAuthOriginal;
