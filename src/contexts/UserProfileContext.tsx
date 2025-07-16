'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';

interface UserProfile {
  sub?: string;
  id?: string;
  schulnummer?: string;
  rolle?: string;
  attributes?: {
    schulnummer?: string | string[];
    rolle?: string | string[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  schulnummer: string | null;
  userId: string | null;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
  keycloakConfig: KeycloakConfig;
  isAuthenticated: boolean;
}

export function UserProfileProvider({ children, keycloakConfig, isAuthenticated }: UserProfileProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!isAuthenticated) {
      setUserProfile(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = new KeycloakClient(keycloakConfig);
      const profile = await client.getCurrentUserProfile();
      
      // Check if user has the required "LEIT" role
      const userRole = profile.rolle || profile.attributes?.rolle?.[0] || profile.attributes?.rolle;
      if (userRole !== 'LEIT') {
        setError('Dieses Tool kann nur mit einem Account der Schulleitung verwendet werden. Ihre Rolle: ' + (userRole || 'Nicht definiert'));
        setUserProfile(null);
        return;
      }
      
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [isAuthenticated, keycloakConfig.url, keycloakConfig.realm]);

  // Set up periodic token refresh check
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const checkTokenExpiry = async () => {
      try {
        const client = new KeycloakClient(keycloakConfig);
        // Only check if token is valid, don't clear profile immediately
        const isValid = await client.ensureValidToken();
        if (!isValid) {
          // Token refresh failed, user needs to re-authenticate
          setError('Session expired. Please log in again.');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Token refresh check failed:', error);
        // Don't clear profile on network errors, only on auth failures
        if (error instanceof Error && error.message.includes('Authentication expired')) {
          setError('Session expired. Please log in again.');
          setUserProfile(null);
        }
      }
    };

    // Check token every 10 minutes (increased from 5 to be less aggressive)
    const interval = setInterval(checkTokenExpiry, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, keycloakConfig]);

  const schulnummer = userProfile?.schulnummer || 
                     (Array.isArray(userProfile?.attributes?.schulnummer) 
                       ? userProfile?.attributes?.schulnummer[0] 
                       : userProfile?.attributes?.schulnummer) || 
                     null;

  // Debug logging
  if (process.env.NODE_ENV === 'development' && userProfile) {
    console.log('UserProfile full data:', userProfile);
    console.log('Extracted schulnummer:', schulnummer);
    console.log('Direct schulnummer:', userProfile.schulnummer);
    console.log('Attributes schulnummer:', userProfile.attributes?.schulnummer);
  }

  const userId = userProfile?.sub || userProfile?.id || null;

  const value: UserProfileContextType = {
    userProfile,
    loading,
    error,
    schulnummer,
    userId,
    refreshProfile
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}