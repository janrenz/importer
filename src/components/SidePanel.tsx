'use client';

import { KeycloakConfig } from '@/types';
import KeycloakConfigComponent from './KeycloakConfig';

interface SidePanelProps {
  keycloakConfig: KeycloakConfig;
  onConfigChange: (config: KeycloakConfig) => void;
  isKeycloakAuthenticated: boolean;
}

export default function SidePanel({ keycloakConfig, onConfigChange, isKeycloakAuthenticated }: SidePanelProps) {
  return (
    <div className="w-80 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-6 space-y-6">
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
      />

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-start space-x-2">
            <svg className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              Die Konfiguration wird automatisch getestet, wenn Sie Änderungen vornehmen.
            </p>
          </div>
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
  );
}