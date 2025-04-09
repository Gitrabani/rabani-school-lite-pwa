
import React from 'react';
import { AuthProvider as AuthProviderOriginal, useAuth as useAuthOriginal } from './auth/AuthProvider';

// Direct export to ensure React context works correctly
export { AuthProviderOriginal as AuthProvider, useAuthOriginal as useAuth };
