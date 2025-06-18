'use client';

import React, { useState, useCallback } from 'react';
import { User, KeycloakConfig, SyncableAttribute } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';
import SyncProgress from './SyncProgress';

const AVAILABLE_ATTRIBUTES: SyncableAttribute[] = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'userType', label: 'User Type (Student/Teacher)', required: true },
];

interface ManualUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'teacher';
}

interface SyncResult {
  userId: string;
  success: boolean;
  existed: boolean;
  error?: string;
}

interface CreateTabProps {
  keycloakConfig: KeycloakConfig;
  isKeycloakAuthenticated: boolean;
}

export default function CreateTab({ keycloakConfig, isKeycloakAuthenticated }: CreateTabProps) {
  const [manualUsers, setManualUsers] = useState<ManualUser[]>([
    { id: '1', firstName: '', lastName: '', email: '', userType: 'teacher' }
  ]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [syncComplete, setSyncComplete] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);

  const addRow = useCallback(() => {
    const newId = (Math.max(...manualUsers.map(u => parseInt(u.id))) + 1).toString();
    setManualUsers(prev => [...prev, {
      id: newId,
      firstName: '',
      lastName: '',
      email: '',
      userType: 'teacher'
    }]);
    // Reset sync state when data changes
    setSyncResults([]);
    setSyncComplete(false);
  }, [manualUsers]);

  const removeRow = useCallback((id: string) => {
    if (manualUsers.length > 1) {
      setManualUsers(prev => prev.filter(u => u.id !== id));
      // Reset sync state when data changes
      setSyncResults([]);
      setSyncComplete(false);
    }
  }, [manualUsers.length]);

  const updateUser = useCallback((id: string, field: keyof ManualUser, value: string) => {
    setManualUsers(prev => prev.map(user => 
      user.id === id ? { ...user, [field]: value } : user
    ));
    // Reset sync state when data changes
    setSyncResults([]);
    setSyncComplete(false);
  }, []);

  const validateUsers = useCallback(() => {
    const validUsers = manualUsers.filter(user => 
      user.firstName.trim() && 
      user.lastName.trim() && 
      user.email.trim() && 
      user.email.includes('@')
    );
    return validUsers;
  }, [manualUsers]);

  const convertToUsers = useCallback((manualUsers: ManualUser[]): User[] => {
    return manualUsers.map(user => ({
      id: user.id,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
      email: user.email.trim().toLowerCase(),
      userType: user.userType,
      schildId: `manual-${user.id}`,
      klasse: user.userType === 'student' ? 'Manual' : undefined
    }));
  }, []);

  const handleSync = async (dryRun: boolean = false) => {
    const validManualUsers = validateUsers();
    if (validManualUsers.length === 0) {
      alert('Bitte geben Sie mindestens einen gültigen Benutzer mit Name und E-Mail-Adresse ein.');
      return;
    }

    // Only allow teachers for actual sync
    const teachersToSync = validManualUsers.filter(u => u.userType === 'teacher');
    if (!dryRun && teachersToSync.length === 0) {
      alert('Nur Lehreraccounts können synchronisiert werden. Bitte markieren Sie mindestens einen Benutzer als Lehrer.');
      return;
    }

    if (!dryRun && (!keycloakConfig.url || !keycloakConfig.username || !keycloakConfig.password)) {
      alert('Bitte füllen Sie alle Keycloak-Konfigurationsfelder aus.');
      return;
    }

    setIsSyncing(true);
    setSyncResults([]);
    setSyncComplete(false);
    setIsDryRun(dryRun);

    const client = new KeycloakClient(keycloakConfig);
    const usersToProcess = dryRun ? validManualUsers : teachersToSync;
    const convertedUsers = convertToUsers(usersToProcess);

    try {
      if (!dryRun) {
        const authenticated = await client.authenticate();
        if (!authenticated) {
          alert('Keycloak-Authentifizierung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
          setIsSyncing(false);
          return;
        }
      }

      const results: SyncResult[] = [];

      for (const user of convertedUsers) {
        try {
          const result = await client.syncUser(user, AVAILABLE_ATTRIBUTES, dryRun);
          results.push({
            userId: user.id,
            success: result.success,
            existed: result.existed,
            error: result.error,
          });
        } catch (error) {
          results.push({
            userId: user.id,
            success: false,
            existed: false,
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          });
        }
        
        setSyncResults([...results]);
      }

      setSyncComplete(true);
    } catch (error) {
      alert(`${dryRun ? 'Testlauf' : 'Synchronisation'} fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const validUsers = validateUsers();
  const teacherCount = validUsers.filter(u => u.userType === 'teacher').length;
  const canSync = teacherCount > 0 && !isSyncing;
  const canTest = validUsers.length > 0 && !isSyncing;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Benutzer manuell erstellen
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Geben Sie Benutzerdaten direkt ein und synchronisieren Sie sie mit Keycloak
                  </p>
                </div>
              </div>
              <button
                onClick={addRow}
                className="btn-primary text-sm px-3 py-2"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Zeile hinzufügen
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Vorname</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Nachname</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">E-Mail</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Typ</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {manualUsers.map((user, index) => {
                    const isValid = user.firstName.trim() && user.lastName.trim() && user.email.trim() && user.email.includes('@');
                    return (
                      <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={user.firstName}
                            onChange={(e) => updateUser(user.id, 'firstName', e.target.value)}
                            placeholder="Vorname"
                            className="w-full px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={user.lastName}
                            onChange={(e) => updateUser(user.id, 'lastName', e.target.value)}
                            placeholder="Nachname"
                            className="w-full px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) => updateUser(user.id, 'email', e.target.value)}
                            placeholder="email@example.com"
                            className="w-full px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={user.userType}
                            onChange={(e) => updateUser(user.id, 'userType', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="teacher">Lehrer</option>
                            <option value="student">Schüler</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} title={isValid ? 'Gültig' : 'Unvollständig'} />
                            {manualUsers.length > 1 && (
                              <button
                                onClick={() => removeRow(user.id)}
                                className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Zeile löschen"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {validUsers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 dark:text-blue-200">
                    {validUsers.length} gültige Benutzer eingegeben • {teacherCount} Lehrer können synchronisiert werden
                  </span>
                </div>
              </div>
            )}

            {validUsers.some(u => u.userType === 'student') && (
              <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-orange-800 dark:text-orange-200">
                    Schüleraccounts können nur im Testlauf validiert, aber nicht synchronisiert werden.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {isSyncing || syncResults.length > 0 ? (
            <SyncProgress
              results={syncResults}
              totalUsers={isDryRun ? validUsers.length : teacherCount}
              isComplete={syncComplete}
              isDryRun={isDryRun}
              onRunActualSync={isDryRun && syncComplete ? () => handleSync(false) : undefined}
            />
          ) : (
            <div className="card p-4 sticky top-24">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Benutzer erstellen
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {validUsers.length > 0 
                      ? `${validUsers.length} Benutzer bereit`
                      : 'Geben Sie Benutzerdaten in die Tabelle ein'
                    }
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleSync(true)}
                    disabled={!canTest}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      canTest 
                        ? 'btn-accent shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isSyncing && isDryRun ? 'Teste...' : 'Testlauf starten'}
                  </button>
                  
                  <button
                    onClick={() => handleSync(false)}
                    disabled={!canSync}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      canSync 
                        ? 'btn-primary shadow-lg hover:shadow-xl transform hover:scale-105' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isSyncing && !isDryRun ? 'Erstelle...' : 'Benutzer erstellen'}
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Testlauf Info</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Validiert alle eingegebenen Daten und simuliert den Erstellungsprozess ohne tatsächliche Änderungen an Keycloak.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}