'use client';

import { useState } from 'react';

interface LogoutPanelProps {
  onBack: () => void;
  onLogout: () => Promise<void>;
}

export default function LogoutPanel({ onBack, onLogout }: LogoutPanelProps) {
  const [expandedSections, setExpandedSections] = useState<{
    localApp: boolean;
    resetItems: boolean;
  }>({
    localApp: false,
    resetItems: false
  });

  const toggleSection = (section: 'localApp' | 'resetItems') => {
    console.log('Toggling section:', section);
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      console.log('New expanded state:', newState);
      return newState;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          Debug: localApp={expandedSections.localApp.toString()}, resetItems={expandedSections.resetItems.toString()}
        </div>
      )}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Ausloggen
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Sitzung beenden und Daten zurücksetzen
        </p>
      </div>

      <div className="space-y-4">
        {/* Local App Section */}
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <button
            onClick={() => toggleSection('localApp')}
            className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Lokale Anwendung
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    (Klicken zum {expandedSections.localApp ? 'Schließen' : 'Öffnen'})
                  </span>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-blue-600 dark:text-blue-400 transform transition-transform duration-200 ${
                  expandedSections.localApp ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${
            expandedSections.localApp 
              ? 'max-h-screen opacity-100 py-0' 
              : 'max-h-0 opacity-0 py-0'
          } overflow-hidden`}>
            <div className="px-6 pb-6">
              <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                Diese Anwendung läuft vollständig lokal in Ihrem Browser. Es gibt keine Server-Sitzung, die beendet werden muss. 
                Um alle Daten zu löschen und die Anwendung zurückzusetzen, laden Sie einfach die Seite neu.
              </p>
            </div>
          </div>
        </div>

        {/* Reset Items Section */}
        <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <button
            onClick={() => toggleSection('resetItems')}
            className="w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    Was wird zurückgesetzt
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    (Klicken zum {expandedSections.resetItems ? 'Schließen' : 'Öffnen'})
                  </span>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-amber-600 dark:text-amber-400 transform transition-transform duration-200 ${
                  expandedSections.resetItems ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          <div className={`transition-all duration-300 ease-in-out ${
            expandedSections.resetItems 
              ? 'max-h-screen opacity-100 py-0' 
              : 'max-h-0 opacity-0 py-0'
          } overflow-hidden`}>
            <div className="px-6 pb-6">
              <ul className="text-amber-700 dark:text-amber-300 space-y-1">
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

      <div className="flex items-center justify-center space-x-4 pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
        >
          Zurück
        </button>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Ausloggen & Seite neu laden</span>
        </button>
      </div>
    </div>
  );
}