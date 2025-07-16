'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { KeycloakClient } from '@/lib/keycloakClient';
import { KeycloakConfig } from '@/types';

interface LogoutButtonProps {
  keycloakConfig: KeycloakConfig;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export default function LogoutButton({ keycloakConfig, onLogout, isAuthenticated = false }: LogoutButtonProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoutFromKeycloak, setLogoutFromKeycloak] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    setIsLoggingOut(true);
    
    try {
      // Perform Keycloak logout only if checkbox is checked
      if (logoutFromKeycloak) {
        const client = new KeycloakClient(keycloakConfig);
        await client.logout();
      } else {
        // Perform only local logout
        const client = new KeycloakClient(keycloakConfig);
        client.performLocalLogout();
      }
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Call parent onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Show success message for 2 seconds, then reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
      // Still show success message and reload even if remote logout fails
      setShowSuccessMessage(true);
      
      if (onLogout) {
        onLogout();
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderModal = (content: React.ReactNode) => {
    if (!mounted) return null;
    return createPortal(content, document.body);
  };

  // Only show logout button if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowLogoutDialog(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        title="Ausloggen"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden sm:inline">Ausloggen</span>
      </button>

      {/* Logout Dialog */}
      {showLogoutDialog && renderModal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Ausloggen
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sitzung beenden
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Lokale Anwendung
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                        Diese Anwendung läuft vollständig lokal in Ihrem Browser. Es gibt keine Server-Sitzung, die beendet werden muss. 
                        Um alle Daten zu löschen und die Anwendung zurückzusetzen, laden Sie einfach die Seite neu.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                        Was wird zurückgesetzt:
                      </h4>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• Keycloak-Konfiguration</li>
                        <li>• Hochgeladene XML-Dateien</li>
                        <li>• Ausgewählte Benutzer</li>
                        <li>• Manuell erstellte Benutzer</li>
                        <li>• Synchronisationsergebnisse</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={logoutFromKeycloak}
                      onChange={(e) => setLogoutFromKeycloak(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-5 h-5 rounded border-2 transition-colors ${
                      logoutFromKeycloak
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}>
                      {logoutFromKeycloak && (
                        <svg className="absolute inset-0 w-3 h-3 text-white m-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                      Auch aus Keycloak ausloggen
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {logoutFromKeycloak 
                    ? "Beendet die Sitzung sowohl lokal als auch in Keycloak"
                    : "Beendet nur die lokale Sitzung, Keycloak-Sitzung bleibt aktiv"
                  }
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Ausloggen...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Ausloggen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && renderModal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Erfolgreich ausgeloggt
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Alle Daten wurden zurückgesetzt. Die Seite wird neu geladen...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}