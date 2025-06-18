'use client';

import { useState, useCallback } from 'react';
import ImportTab from '@/components/ImportTab';
import CreateTab from '@/components/CreateTab';
import DeleteTab from '@/components/DeleteTab';
import HelpTab from '@/components/HelpTab';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';
import FileUpload from '@/components/FileUpload';
import { User, KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';

type TabType = 'import' | 'create' | 'delete' | 'help';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('import');
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
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <div className={`w-2 h-2 rounded-full ${
                  isKeycloakAuthenticated 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span>{isKeycloakAuthenticated ? 'Angemeldet' : 'Nicht angemeldet'}</span>
              </div>
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