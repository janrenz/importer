'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
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
    if (process.env.NODE_ENV === 'development') {
      console.log('UserProfileContext.refreshProfile called:', {
        isAuthenticated,
        currentUserProfile: !!userProfile,
        currentLoading: loading,
        currentError: error
      });
    }
    
    if (!isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('UserProfileContext: Not authenticated, clearing profile');
      }
      setUserProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('UserProfileContext: Starting profile fetch, setting loading=true');
    }
    setLoading(true);
    setError(null);

    try {
      const client = new KeycloakClient(keycloakConfig);
      
      // Check if client has valid token before making request
      if (process.env.NODE_ENV === 'development') {
        console.log('UserProfileContext: Checking token validity before profile fetch');
        const isTokenValid = await client.ensureValidToken();
        console.log('UserProfileContext: Token validity check result:', isTokenValid);
      }
      
      const profile = await client.getCurrentUserProfile();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile fetched successfully:', profile);
      }
      
      // Check if user has the required "LEIT" role
      const userRole = profile.rolle || profile.attributes?.rolle?.[0] || profile.attributes?.rolle;
      if (userRole !== 'LEIT') {
        setError('Dieses Tool kann nur mit einem Account der Schulleitung verwendet werden. Ihre Rolle: ' + (userRole || 'Nicht definiert'));
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      setUserProfile(profile);
      setLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('UserProfileContext: Profile fetch successful, setting loading=false');
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      setUserProfile(null);
      setLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('UserProfileContext: Profile fetch failed, setting loading=false');
      }
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserProfileContext useEffect triggered:', {
        isAuthenticated,
        keycloakUrl: keycloakConfig.url,
        keycloakRealm: keycloakConfig.realm,
        timestamp: new Date().toISOString()
      });
    }
    
    // Always call refreshProfile - it will handle both authenticated and unauthenticated cases
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

  // Extract schulnummer with simple, reliable logic
  const schulnummer = useMemo(() => {
    if (!userProfile) return null;
    
    // Define all possible paths to check
    const paths = [
      userProfile.schulnummer,
      userProfile.attributes?.schulnummer,
      userProfile.fullProfile?.attributes?.schulnummer
    ];
    
    // Find the first non-null, non-undefined value
    for (const path of paths) {
      if (path !== null && path !== undefined) {
        // Handle array format (Keycloak attributes are often arrays)
        if (Array.isArray(path)) {
          const firstValue = path[0];
          if (firstValue !== null && firstValue !== undefined) {
            return firstValue;
          }
        } else {
          // Handle string/number format
          return path;
        }
      }
    }
    
    return null;
  }, [userProfile]);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('UserProfile Context - extracted schulnummer:', schulnummer);
    console.log('UserProfile Context - loading:', loading, 'authenticated:', isAuthenticated);
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