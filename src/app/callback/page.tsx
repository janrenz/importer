'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { parseCallbackURL } from '@/lib/oauth2-utils';

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const currentURL = window.location.href;
        if (process.env.NODE_ENV === 'development') {
          console.log('Callback URL:', currentURL);
        }
        const params = parseCallbackURL(currentURL);
        if (process.env.NODE_ENV === 'development') {
          console.log('Parsed params:', params);
        }

        if (params.error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('OAuth2 error:', params.error, params.error_description);
          }
          setError(params.error_description || params.error);
          setStatus('error');
          return;
        }

        if (!params.code) {
          if (process.env.NODE_ENV === 'development') {
            console.error('No authorization code received');
          }
          setError('No authorization code received. This page should only be accessed via OAuth2 redirect from Keycloak.');
          setStatus('error');
          return;
        }

        // Store the authorization code and state in session storage
        if (process.env.NODE_ENV === 'development') {
          console.log('Storing OAuth2 code in session storage');
        }
        sessionStorage.setItem('oauth2_code', params.code);
        if (params.state) {
          sessionStorage.setItem('oauth2_state', params.state);
        }

        setStatus('success');
        
        // Redirect back to main application after a short delay
        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Redirecting to main page');
          }
          router.push('/');
        }, 2000);

      } catch (err) {
        console.error('Callback processing error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    // Add timeout to prevent infinite processing
    const timeoutId = setTimeout(() => {
      if (status === 'processing') {
        if (process.env.NODE_ENV === 'development') {
          console.error('Callback processing timeout');
        }
        setError('Callback processing timeout. Please try again.');
        setStatus('error');
      }
    }, 10000); // 10 second timeout

    handleCallback();

    return () => clearTimeout(timeoutId);
  }, [router, status]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Verarbeitung der Anmeldung...
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Bitte warten Sie, während Ihre Anmeldung verarbeitet wird.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Anmeldung fehlgeschlagen
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error || 'Ein unbekannter Fehler ist aufgetreten'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Zurück zur Anwendung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Anmeldung erfolgreich
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Sie werden automatisch zur Anwendung weitergeleitet...
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}