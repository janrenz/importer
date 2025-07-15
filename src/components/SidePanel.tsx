'use client';

import { useState } from 'react';
import { KeycloakConfig } from '@/types';
import KeycloakConfigComponent from './KeycloakConfig';

interface SidePanelProps {
  keycloakConfig: KeycloakConfig;
  onConfigChange: (config: KeycloakConfig) => void;
  isKeycloakAuthenticated: boolean;
  onLogin?: () => void;
  isLoading?: boolean;
  callbackPending?: boolean;
}

export default function SidePanel({ keycloakConfig, onConfigChange, isKeycloakAuthenticated, onLogin, isLoading = false, callbackPending = false }: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Collapse Toggle Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={isCollapsed ? 'Seitenleiste erweitern' : 'Seitenleiste einklappen'}
        >
          <svg 
            className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {!isCollapsed && (
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
              Einklappen
            </span>
          )}
        </button>
      </div>

      {/* Panel Content */}
      <div className={`${isCollapsed ? 'hidden' : 'block'} p-6 space-y-6 flex-1`}>
      
      {/* Keycloak Login Section - Always visible */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Keycloak-Anmeldung
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                isKeycloakAuthenticated 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {isKeycloakAuthenticated ? 'Angemeldet' : 'Nicht angemeldet'}
              </span>
            </div>
          </div>
        </div>

        {!isKeycloakAuthenticated && (
          <button
            onClick={onLogin}
            disabled={isLoading || callbackPending}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              isLoading || callbackPending
                ? 'bg-orange-300 dark:bg-orange-700 text-orange-500 dark:text-orange-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {isLoading || callbackPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{callbackPending ? 'Authentifizierung läuft...' : 'Anmelden...'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Bei Keycloak anmelden</span>
              </>
            )}
          </button>
        )}

        {isKeycloakAuthenticated && (
          <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Erfolgreich angemeldet
                </h4>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Sie können nun Benutzer synchronisieren
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keycloak Configuration hidden for now */}
      <div style={{ display: 'none' }}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Keycloak-Konfiguration
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              isKeycloakAuthenticated 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {isKeycloakAuthenticated ? 'Verbunden' : 'Nicht verbunden'}
            </span>
          </div>
        </div>
      </div>

        <KeycloakConfigComponent
          config={keycloakConfig}
          onConfigChange={onConfigChange}
          onLogin={onLogin}
          isAuthenticated={isKeycloakAuthenticated}
          isLoading={isLoading}
          callbackPending={callbackPending}
        />

        <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                Bei Keycloak angemeldet
              </h3>
              <p className="text-xs text-green-800 dark:text-green-200">
                Sie können nun Benutzer synchronisieren
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          {!isKeycloakAuthenticated && (
            <div className="flex items-start space-x-2">
              <svg className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                Klicken Sie auf \"Bei Keycloak anmelden\" um die OAuth2-Authentifizierung zu starten.
              </p>
            </div>
          )}
          <div className="flex items-start space-x-2">
            <svg className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>
              Stellen Sie sicher, dass Ihr Keycloak-Benutzer administrative Rechte für die Benutzerverwaltung hat.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <svg className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Alle Anmeldedaten werden nur in Ihrer Browser-Session gespeichert.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Collapsed State Indicator */}
      {isCollapsed && (
        <div className="p-4 flex flex-col items-center space-y-4">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className={`w-2 h-2 rounded-full ${
            isKeycloakAuthenticated 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}></div>
        </div>
      )}
    </div>
  );
}