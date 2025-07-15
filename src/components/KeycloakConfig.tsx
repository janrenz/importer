'use client';

import React from 'react';
import { KeycloakConfig } from '@/types';

interface KeycloakConfigProps {
  config: KeycloakConfig;
  onConfigChange: (config: KeycloakConfig) => void;
  onLogin?: () => void;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  callbackPending?: boolean;
}

export default function KeycloakConfigComponent({ config, onConfigChange, onLogin, isAuthenticated = false, isLoading = false, callbackPending = false }: KeycloakConfigProps) {
  // Auto-generate redirect URI based on current origin
  const defaultRedirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/callback`
    : 'https://localhost:3000/callback';
  
  // Update redirect URI if it's the default localhost and we're running on a different origin
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (config.redirectUri === 'http://localhost:3000/callback' || config.redirectUri === 'http://localhost:3004/callback' || config.redirectUri === 'https://localhost:3000/callback') && window.location.origin !== config.redirectUri.split('/callback')[0]) {
      onConfigChange({ ...config, redirectUri: defaultRedirectUri });
    }
  }, [config, onConfigChange, defaultRedirectUri]);

  const handleChange = (field: keyof KeycloakConfig, value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="card p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Keycloak-Konfiguration
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Verbinden Sie sich mit Ihrer Keycloak-Instanz
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="keycloak-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Keycloak URL
            </label>
            <input
              type="url"
              id="keycloak-url"
              value={config.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://keycloak.example.com"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="realm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Realm
            </label>
            <input
              type="text"
              id="realm"
              value={config.realm}
              onChange={(e) => handleChange('realm', e.target.value)}
              placeholder="master"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              id="client-id"
              value={config.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              placeholder="logineo-import"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="redirect-uri" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Redirect URI
          </label>
          <input
            type="url"
            id="redirect-uri"
            value={config.redirectUri || defaultRedirectUri}
            onChange={(e) => handleChange('redirectUri', e.target.value)}
            placeholder={defaultRedirectUri}
            className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
            required
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Diese URI muss in der Keycloak-Client-Konfiguration als gültige Redirect URI eingetragen sein.
          </p>
        </div>
      </div>

      {/* Login Button */}
      <div className="mt-6">
        <button
          onClick={onLogin}
          disabled={!config.url || !config.realm || !config.clientId || !config.redirectUri || isLoading}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
            isAuthenticated
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : callbackPending
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              : !config.url || !config.realm || !config.clientId || !config.redirectUri
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : isLoading
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Verbindung wird getestet...</span>
            </>
          ) : isAuthenticated ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Erfolgreich angemeldet</span>
            </>
          ) : callbackPending ? (
            <>
              <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Anmeldung wird abgeschlossen...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Bei Keycloak anmelden</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">OAuth2 mit PKCE</h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Sichere Authentifizierung ohne Client-Secrets. Sie werden zu Keycloak weitergeleitet und nach erfolgreicher Anmeldung zurückgeleitet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}