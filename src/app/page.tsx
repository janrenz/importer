'use client';

import { useState, useCallback, useEffect } from 'react';
import ImportTab from '@/components/ImportTab';
import CreateTab from '@/components/CreateTab';
// import DeleteTab from '@/components/DeleteTab';
import UsersTab from '@/components/UsersTab';
import HelpTab from '@/components/HelpTab';
import PrincipalRegistration from '@/components/PrincipalRegistration';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import LogoutButton from '@/components/LogoutButton';
import SchoolInfo from '@/components/SchoolInfo';
import { UserProfileProvider, useUserProfile } from '@/contexts/UserProfileContext';
import { User, KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';

type TabType = 'start' | 'import' | 'create' | 'principal' | 'users' | 'help' | 'logout';

interface AppContentProps {
  keycloakConfig: KeycloakConfig;
  setKeycloakConfig: (config: KeycloakConfig) => void;
  isKeycloakAuthenticated: boolean;
  setIsKeycloakAuthenticated: (authenticated: boolean) => void;
}

function AppContent({ 
  keycloakConfig, 
  setKeycloakConfig, 
  isKeycloakAuthenticated, 
  setIsKeycloakAuthenticated 
}: AppContentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('start');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [totalKeycloakUsers, setTotalKeycloakUsers] = useState<number>(0);
  
  // Use the context instead of fetching user profile directly
  const { userProfile, error: profileError, schulnummer, refreshProfile } = useUserProfile();

  const handleUsersLoaded = useCallback((loadedUsers: User[]) => {
    setUsers(loadedUsers);
  }, []);

  const handleUserCountUpdate = useCallback((count: number) => {
    setTotalKeycloakUsers(count);
  }, []);

  const [callbackPending, setCallbackPending] = useState(false);

  // Handle profile errors (like role validation failures)
  useEffect(() => {
    if (profileError && isKeycloakAuthenticated) {
      alert(profileError);
      // Perform logout if there's a profile error
      const logout = async () => {
        try {
          const client = new KeycloakClient(keycloakConfig);
          await client.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          setIsKeycloakAuthenticated(false);
        }
      };
      logout();
    }
  }, [profileError, isKeycloakAuthenticated, keycloakConfig]);

  // Check for OAuth2 callback completion on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Update the config to use the correct redirect URI
      const updatedConfig = {
        ...keycloakConfig,
        redirectUri: typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/callback` : keycloakConfig.redirectUri
      };
      
      // Update redirect URI if it changed
      if (typeof window !== 'undefined') {
        const currentRedirectUri = `${window.location.protocol}//${window.location.host}/callback`;
        if (keycloakConfig.redirectUri !== currentRedirectUri) {
          setKeycloakConfig(prev => ({
            ...prev,
            redirectUri: currentRedirectUri
          }));
        }
      }
      
      const keycloakClient = new KeycloakClient(updatedConfig);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Checking auth status...');
        console.log('Is callback pending:', keycloakClient.isCallbackPending());
        console.log('Is authenticated:', keycloakClient.isAuthenticated());
      }
      
      if (keycloakClient.isCallbackPending()) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Callback pending, completing login...');
        }
        setCallbackPending(true);
        setIsLoginLoading(true);
        
        try {
          const success = await keycloakClient.completeLogin();
          if (process.env.NODE_ENV === 'development') {
            console.log('Login completion result:', success);
          }
          setIsKeycloakAuthenticated(success);
          // Manually refresh profile after successful authentication to ensure header updates
          if (success) {
            setTimeout(() => refreshProfile(), 100);
          }
        } catch (error) {
          console.error('OAuth2 completion error:', error);
          setIsKeycloakAuthenticated(false);
        } finally {
          setCallbackPending(false);
          setIsLoginLoading(false);
        }
      } else {
        const isAuth = keycloakClient.isAuthenticated();
        setIsKeycloakAuthenticated(isAuth);
        // Manually refresh profile after successful authentication detection
        if (isAuth) {
          setTimeout(() => refreshProfile(), 100);
        }
      }
    };

    checkAuthStatus();
  }, []); // Empty dependency array to run only once on mount

  const handleOAuth2Login = useCallback(async () => {
    if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId || !keycloakConfig.redirectUri) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Missing required OAuth2 configuration');
      }
      return;
    }

    setIsLoginLoading(true);
    
    try {
      const client = new KeycloakClient(keycloakConfig);
      await client.initiateLogin();
      // User will be redirected to Keycloak, so we don't need to handle response here
    } catch (error) {
      console.error('OAuth2 login error:', error);
      setIsLoginLoading(false);
    }
  }, [keycloakConfig]);

  const handleManualLogin = useCallback(() => {
    handleOAuth2Login();
  }, [handleOAuth2Login]);

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
      id: 'users' as TabType,
      label: `Nutzer verwalten${totalKeycloakUsers > 0 ? ` (${totalKeycloakUsers})` : ''}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
    // {
    //   id: 'delete' as TabType,
    //   label: 'Löschen',
    //   icon: (
    //     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    //     </svg>
    //   ),
    // },
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
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Welcome Section */}
            <div className="text-center space-y-6">
              {/* <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div> */}
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Willkommen bei der telli Nutzerverwaltung für Schulleitungen.
                </h1>
                <p className="text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto">
                  Erstellen Sie telli Zugänge für die Lehrkräfte Ihrer Schule.
                </p>
              </div>
            </div>

            {/* Process Steps */}
            <div className="space-y-8">
              {/* <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Einrichtungsprozess
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Folgen Sie diesen Schritten zur erfolgreichen Einrichtung
                </p>
              </div> */}

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Schulleiter anlegen
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed mb-4 flex-grow">
                    Erstellen Sie zunächst einmalig einen Administrator-Account für die Schulleitung über den entsprechenden Tab.
                  </p>
                  <button
                    onClick={() => setActiveTab('principal')}
                    disabled={isKeycloakAuthenticated}
                    className={`w-full px-4 py-2 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg ${
                      isKeycloakAuthenticated
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {isKeycloakAuthenticated ? 'Eingerichtet ✓' : 'Schulleiter einrichten'}
                  </button>
                </div>

                {/* Step 2 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Als Schulleiter anmelden
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed mb-4 flex-grow">
                    Melden Sie sich mit dem erstellten und bestätigten (Email) Schulleiter-Account in der Nutzerverwaltung (Keycloak) an. 
                  </p>
                  <button
                    onClick={handleManualLogin}
                    disabled={isLoginLoading || isKeycloakAuthenticated}
                    className={`w-full px-4 py-2 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg ${
                      isKeycloakAuthenticated
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isKeycloakAuthenticated ? 'Angemeldet ✓' : isLoginLoading ? 'Anmelden...' : 'Keycloak Login'}
                  </button>
                </div>

                {/* Step 3 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Benutzer importieren
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed mb-4 flex-grow">
                    Importieren Sie Lehrkräfte aus einer SchiLD-Exportdatei oder per manueller CSV-Erstellung.
                  </p>
                  <button
                    onClick={() => setActiveTab('import')}
                    className={`w-full px-4 py-2 font-medium rounded-lg transition-colors shadow-md hover:shadow-lg ${
                      users.length > 0
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {users.length > 0 ? 'XML aktualisieren' : 'XML importieren'}
                  </button>
                </div>

                {/* Step 4 */}
                <div className="card p-6 text-center group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</span>
                  </div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Nutzer verwalten
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed mb-4 flex-grow">
                    Verwalten Sie bestehende Benutzer: aktivieren, deaktivieren oder löschen Sie Accounts nach Bedarf.
                  </p>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Nutzer verwalten
                  </button>
                </div>
              </div>
            </div>

            {/* VIDIS Portal Teaser */}
            <div className="max-w-4xl mx-auto">
              <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Wichtiger Hinweis
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                      Denken Sie daran, telli im VIDIS Portal unter{' '}
                      <a 
                        href="https://service.vidis.schule" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 hover:decoration-blue-500 transition-colors"
                      >
                        https://service.vidis.schule
                      </a>
                      {' '}freizuschalten.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* <div className="card p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      Sichere Verarbeitung
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      Alle Daten werden lokal in Ihrem Browser verarbeitet und nur bei der Synchronisation an die Nutzervervaltung gesendet.
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
              </div> */}

              {/* <div className="card p-6">
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
              </div> */}

              {/* <div className="card p-6">
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
              </div> */}
            </div>
          </div>
        );
      case 'principal':
        return (
          <PrincipalRegistration onBack={() => setActiveTab('start')} isAuthenticated={isKeycloakAuthenticated} />
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
      // case 'delete':
      //   return (
      //     <DeleteTab
      //       keycloakConfig={keycloakConfig}
      //       xmlUsers={users}
      //       isKeycloakAuthenticated={isKeycloakAuthenticated}
      //     />
      //   );
      case 'users':
        return (
          <UsersTab
            keycloakConfig={keycloakConfig}
            isKeycloakAuthenticated={isKeycloakAuthenticated}
            onUserCountUpdate={handleUserCountUpdate}
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
                onClick={async () => {
                  try {
                    const client = new KeycloakClient(keycloakConfig);
                    await client.logout();
                  } catch (error) {
                    console.error('Logout error:', error);
                  } finally {
                    // Always reload the page after logout
                    window.location.reload();
                  }
                }}
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  NRW telli Nutzerverwaltung für Schulleitungen
                </h1>
                <div className="mt-1">
                  {isKeycloakAuthenticated ? (
                    <SchoolInfo 
                      schulnummer={schulnummer || undefined} 
                    />
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Keycloak Integration
                    </p>
                  )}
                </div>
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
              <LogoutButton 
                keycloakConfig={keycloakConfig} 
                isAuthenticated={isKeycloakAuthenticated}
                onLogout={() => {
                  setIsKeycloakAuthenticated(false);
                  setUsers([]);
                  setActiveTab('start');
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* XML Loader - Only for Delete tab */}
          {/* {activeTab === 'delete' && (
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
              <FileUpload onUsersLoaded={handleUsersLoaded} hasLoadedUsers={users.length > 0} />
            </div>
          )} */}

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
            // No automatic connection test for OAuth2 - user must manually login
          }}
          isKeycloakAuthenticated={isKeycloakAuthenticated}
          onLogin={handleManualLogin}
          isLoading={isLoginLoading}
          callbackPending={callbackPending}
        />
      </div>

      <Footer />
    </div>
  );
}

function MainContent() {
  const [keycloakConfig, setKeycloakConfig] = useState<KeycloakConfig>({
    url: 'https://login.fwu-id-prod.ionos.intension.eu',
    realm: 'NutzerverwaltungNRW',
    clientId: 'nrwpublic',
    redirectUri: 'https://localhost:3000/callback',
  });
  const [isKeycloakAuthenticated, setIsKeycloakAuthenticated] = useState(false);

  return (
    <UserProfileProvider 
      keycloakConfig={keycloakConfig} 
      isAuthenticated={isKeycloakAuthenticated}
    >
      <AppContent 
        keycloakConfig={keycloakConfig}
        setKeycloakConfig={setKeycloakConfig}
        isKeycloakAuthenticated={isKeycloakAuthenticated}
        setIsKeycloakAuthenticated={setIsKeycloakAuthenticated}
      />
    </UserProfileProvider>
  );
}

export default function HomePage() {
  return <MainContent />;
}