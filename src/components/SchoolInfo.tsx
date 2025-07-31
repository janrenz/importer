'use client';

import { useState, useEffect } from 'react';
import { findSchoolByNumber, getSchulformColor, getRechtstatusColor, type SchoolInfo } from '@/lib/schoolData';

interface SchoolInfoProps {
  schulnummer: string | number | undefined | null;
  className?: string;
  loading?: boolean;
}

type SchoolInfoState = {
  status: 'loading' | 'empty' | 'found' | 'not-found' | 'error';
  schulnummer: string | null;
  schoolData: SchoolInfo | null;
  error?: string;
};

export default function SchoolInfo({ schulnummer, className = '', loading = false }: SchoolInfoProps) {
  const [state, setState] = useState<SchoolInfoState>({
    status: 'loading',
    schulnummer: null,
    schoolData: null
  });

  // Effect to handle schulnummer changes
  useEffect(() => {
    // Start with loading state if external loading is true
    if (loading) {
      setState({
        status: 'loading',
        schulnummer: null,
        schoolData: null
      });
      return;
    }

    // Normalize schulnummer
    let normalizedSchulnummer: string | null = null;
    
    if (schulnummer !== null && schulnummer !== undefined) {
      if (typeof schulnummer === 'string') {
        const trimmed = schulnummer.trim();
        normalizedSchulnummer = trimmed === '' ? null : trimmed;
      } else if (typeof schulnummer === 'number') {
        normalizedSchulnummer = schulnummer.toString();
      }
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('SchoolInfo processing:', {
        received: schulnummer,
        type: typeof schulnummer,
        normalized: normalizedSchulnummer,
        loading
      });
    }

    // Handle empty schulnummer
    if (!normalizedSchulnummer) {
      setState({
        status: 'empty',
        schulnummer: null,
        schoolData: null
      });
      return;
    }

    // Look up school data
    try {
      const schoolData = findSchoolByNumber(normalizedSchulnummer);
      
      if (schoolData) {
        setState({
          status: 'found',
          schulnummer: normalizedSchulnummer,
          schoolData
        });
      } else {
        setState({
          status: 'not-found',
          schulnummer: normalizedSchulnummer,
          schoolData: null
        });
      }
    } catch (error) {
      console.error('Error finding school by number:', error);
      setState({
        status: 'error',
        schulnummer: normalizedSchulnummer,
        schoolData: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [schulnummer, loading]);

  // Render based on state
  switch (state.status) {
    case 'loading':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Lade Schuldaten...
            </span>
          </div>
        </div>
      );

    case 'empty':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Schulnummer nicht verfügbar
            </span>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 dark:bg-red-900 rounded-lg">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Fehler beim Laden der Schuldaten
            </span>
          </div>
        </div>
      );

    case 'not-found':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Schule: {state.schulnummer}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            (Nicht in Datenbank gefunden)
          </span>
        </div>
      );

    case 'found':
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          {/* School Number */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {state.schoolData?.Schulnummer}
            </span>
          </div>

          {/* School Form */}
          {state.schoolData?.Schulform && (
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getSchulformColor(state.schoolData.Schulform)}`}>
              {state.schoolData.Schulform}
            </div>
          )}

          {/* Legal Status */}
          {state.schoolData?.Rechtsstatus && (
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getRechtstatusColor(state.schoolData.Rechtsstatus)}`}>
              {state.schoolData.Rechtsstatus}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}