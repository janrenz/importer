'use client';

import { useState } from 'react';

export default function LogoutButton() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

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
      {showLogoutDialog && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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

              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleReload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Seite neu laden</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}