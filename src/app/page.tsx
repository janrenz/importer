'use client';

import { useState, useCallback } from 'react';
import ImportTab from '@/components/ImportTab';
import CreateTab from '@/components/CreateTab';
import DeleteTab from '@/components/DeleteTab';
import HelpTab from '@/components/HelpTab';
import PrincipalRegistration from '@/components/PrincipalRegistration';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import { User, KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';

type TabType = 'start' | 'import' | 'create' | 'delete' | 'principal' | 'help' | 'logout';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('start');
  const [keycloakConfig, setKeycloakConfig] = useState<KeycloakConfig>({
    url: '',
    realm: 'master',
    clientId: 'admin-cli',
    username: '',
    password: '',
  });
  const [isKeycloakAuthenticated, setIsKeycloakAuthenticated] = useState(false);

  const handleUsersLoaded = useCallback((loadedUsers: User[]) => {
    setUsers(loadedUsers);
  }, []);

  const testKeycloakConnection = useCallback(async (config: KeycloakConfig) => {
    if (!config.url || !config.username || !config.password) {
      setIsKeycloakAuthenticated(false);
      return;
    }

    try {
      const client = new KeycloakClient(config);
      const isAuthenticated = await client.authenticate();
      setIsKeycloakAuthenticated(isAuthenticated);
    } catch (error) {
      setIsKeycloakAuthenticated(false);
    }
  }, []);

  const tabs = [
    {
      id: 'start' as TabType,
      label: 'Startseite',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'principal' as TabType,
      label: 'Schulleiter einrichten',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'import' as TabType,
      label: 'SchILD Import',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
    },
    {
      id: 'create' as TabType,
      label: 'Erstellen',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    {
      id: 'delete' as TabType,
      label: 'Löschen',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      id: 'help' as TabType,
      label: 'Hilfe',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'start':
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Welcome Section */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Willkommen bei SchILD Sync
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Synchronisieren Sie Benutzer aus SchILD/Logineo XML-Exporten mit Ihrem Keycloak Identity Management System
                </p>
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Einrichtungsprozess
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Folgen Sie diesen Schritten zur erfolgreichen Einrichtung
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Schulleiter anlegen
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Erstellen Sie zunächst einmalig einen Administrator-Account für die Schulleitung über den entsprechenden Tab.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Als Schulleiter anmelden
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Melden Sie sich mit dem erstellten Schulleiter-Account in Keycloak an und konfigurieren Sie die Verbindungsdaten in der Seitenleiste.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Benutzer importieren
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Importieren Sie Lehrkräfte und Schüler über XML-Upload oder manuelle CSV-Erstellung.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Schnellstart
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Beginnen Sie mit einem dieser Schritte
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setActiveTab('principal')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Schulleiter einrichten</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('import')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>XML importieren</span>
                </button>
              </div>
            </div>

            {/* Features Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Sichere Verarbeitung
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Alle Daten werden lokal in Ihrem Browser verarbeitet. Keine Übertragung an externe Server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Flexible Importoptionen
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Unterstützt SchILD XML-Exporte und CSV-Dateien mit intelligenter Felderkennung.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Testmodus verfügbar
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Testen Sie Ihre Synchronisation vor der eigentlichen Durchführung.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Selektive Synchronisation
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Wählen Sie einzelne Benutzer und Attribute für den Import aus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'principal':
        return (
          <PrincipalRegistration onBack={() => setActiveTab('start')} />
        );
      case 'import':
        return (
          <ImportTab
            keycloakConfig={keycloakConfig}
            isKeycloakAuthenticated={isKeycloakAuthenticated}
            users={users}
            onUsersLoaded={handleUsersLoaded}
          />
        );
      case 'create':
        return (
          <CreateTab
            keycloakConfig={keycloakConfig}
            isKeycloakAuthenticated={isKeycloakAuthenticated}
          />
        );
      case 'delete':
        return (
          <DeleteTab
            keycloakConfig={keycloakConfig}
            xmlUsers={users}
            isKeycloakAuthenticated={isKeycloakAuthenticated}
          />
        );
      case 'help':
        return <HelpTab />;
      case 'logout':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
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
              <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Lokale Anwendung
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      Diese Anwendung läuft vollständig lokal in Ihrem Browser. Es gibt keine Server-Sitzung, die beendet werden muss. 
                      Um alle Daten zu löschen und die Anwendung zurückzusetzen, laden Sie einfach die Seite neu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Was wird zurückgesetzt:
                    </h3>
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
                onClick={() => setActiveTab('import')}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Seite neu laden</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  SchILD Sync
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keycloak Integration
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <div className={`w-2 h-2 rounded-full ${
                  isKeycloakAuthenticated 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span>{isKeycloakAuthenticated ? 'Angemeldet' : 'Nicht angemeldet'}</span>
              </div>
              <button
                onClick={() => setActiveTab('logout')}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Ausloggen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Ausloggen</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* XML Loader - Shared between Import and Delete tabs */}
          {(activeTab === 'import' || activeTab === 'delete') && users.length === 0 && (
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
              <FileUpload onUsersLoaded={handleUsersLoaded} />
            </div>
          )}

          {/* Tab Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {renderTabContent()}
          </div>
        </div>

        {/* Side Panel */}
        <SidePanel
          keycloakConfig={keycloakConfig}
          onConfigChange={(config) => {
            setKeycloakConfig(config);
            testKeycloakConnection(config);
          }}
          isKeycloakAuthenticated={isKeycloakAuthenticated}
        />
      </div>

      <Footer />
    </div>
  );
}