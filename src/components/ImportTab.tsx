'use client';

import React, { useState, useCallback } from 'react';
import UserList from './UserList';
import AttributeSelector from './AttributeSelector';
import SyncProgress from './SyncProgress';
import FileUpload from './FileUpload';
import { User, KeycloakConfig, SyncableAttribute } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';
import { requiresTeacherID, isValidSchILDID } from '@/lib/schoolData';
import { useUserProfile } from '@/contexts/UserProfileContext';

const AVAILABLE_ATTRIBUTES: SyncableAttribute[] = [
  { key: 'firstName', label: 'First Name', required: true },
  { key: 'lastName', label: 'Last Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'userType', label: 'User Type (Student/Teacher)', required: true },
  { key: 'schildId', label: 'SchILD ID', required: true },
  { key: 'klasse', label: 'Class Assignment', required: false },
];

interface SyncResult {
  userId: string;
  success: boolean;
  existed: boolean;
  error?: string;
}

interface ImportTabProps {
  keycloakConfig: KeycloakConfig;
  isKeycloakAuthenticated: boolean;
  users: User[];
  onUsersLoaded: (users: User[]) => void;
}

export default function ImportTab({ keycloakConfig, isKeycloakAuthenticated, users, onUsersLoaded }: ImportTabProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedAttributes, setSelectedAttributes] = useState<Set<string>>(
    new Set(['firstName', 'lastName', 'email'])
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [syncComplete, setSyncComplete] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [showExpertSettings, setShowExpertSettings] = useState(false);
  const { schulnummer: currentUserSchoolId } = useUserProfile();

  // Reset state when users change
  React.useEffect(() => {
    setSelectedUsers(new Set());
    setSyncResults([]);
    setSyncComplete(false);
  }, [users]);

  // Note: Current user's school information is now provided by the UserProfileContext

  const handleUserSelection = useCallback((userId: string, selected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
    // Reset sync state when selection changes
    setSyncResults([]);
    setSyncComplete(false);
  }, []);

  const handleSelectAll = useCallback((filteredUsers: User[]) => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    // Reset sync state when selection changes
    setSyncResults([]);
    setSyncComplete(false);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedUsers(new Set());
    // Reset sync state when selection changes
    setSyncResults([]);
    setSyncComplete(false);
  }, []);

  const handleAttributeSelection = useCallback((attributeKey: string, selected: boolean) => {
    setSelectedAttributes(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(attributeKey);
      } else {
        newSet.delete(attributeKey);
      }
      return newSet;
    });
    // Reset sync state when attribute selection changes
    setSyncResults([]);
    setSyncComplete(false);
  }, []);

  const handleSync = async (dryRun: boolean = false) => {
    const selectedTeachers = users.filter(u => selectedUsers.has(u.id) && u.userType === 'teacher');
    if (selectedTeachers.length === 0) {
      alert('Bitte wählen Sie mindestens eine Lehrkraft zum Synchronisieren aus.');
      return;
    }

    // Check if school is public and requires teacher IDs
    if (currentUserSchoolId && requiresTeacherID(currentUserSchoolId)) {
      const teachersWithInvalidId = selectedTeachers.filter(teacher => !isValidSchILDID(teacher.schildId, currentUserSchoolId));
      if (teachersWithInvalidId.length > 0) {
        const teacherNames = teachersWithInvalidId.map(t => `${t.firstName} ${t.lastName}`).join(', ');
        alert(`Für öffentliche Schulen sind echte SchILD-IDs (nicht automatisch generierte) für alle Lehrkräfte erforderlich.\n\nFolgende Lehrkräfte haben keine gültige SchILD-ID und werden nicht synchronisiert:\n${teacherNames}\n\nBitte stellen Sie sicher, dass alle Lehrkräfte eine echte SchILD-ID aus dem Import haben.`);
        return;
      }
    }

    if (!dryRun && (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId || !keycloakConfig.redirectUri)) {
      alert('Bitte füllen Sie alle Keycloak-Konfigurationsfelder aus.');
      return;
    }
    if (!dryRun && !isKeycloakAuthenticated) {
      alert('Bitte melden Sie sich zuerst bei Keycloak an.');
      return;
    }

    setIsSyncing(true);
    setSyncResults([]);
    setSyncComplete(false);
    setIsDryRun(dryRun);

    const client = new KeycloakClient(keycloakConfig);
    const selectedAttributesList = AVAILABLE_ATTRIBUTES.filter(attr => 
      selectedAttributes.has(attr.key) || attr.required
    );

    try {
      // OAuth2 authentication is handled globally, token is stored in session
      // No need to authenticate here - the client will use the stored token

      const selectedUsersList = users.filter(u => selectedUsers.has(u.id) && u.userType === 'teacher');
      const results: SyncResult[] = [];
      
      if (selectedUsersList.length === 0) {
        alert('Nur Lehrkraft-Accounts können synchronisiert werden. Bitte wählen Sie mindestens eine Lehrkraft aus.');
        setIsSyncing(false);
        return;
      }

      for (const user of selectedUsersList) {
        try {
          const result = await client.syncUser(user, selectedAttributesList, dryRun);
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
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
        
        setSyncResults([...results]);
      }

      setSyncComplete(true);
    } catch (error) {
      alert(`Synchronisation fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const canSync = selectedUsers.size > 0 && 
                  selectedAttributes.size > 0 && 
                  !isSyncing;

  const canTest = selectedUsers.size > 0 && !isSyncing;

  return (
    <div className="space-y-6">
      <FileUpload onUsersLoaded={onUsersLoaded} hasLoadedUsers={users.length > 0} />
      
      {users.length === 0 ? (
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            XML-Datei laden
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Laden Sie eine SchILD XML-Datei, um mit dem Import zu beginnen.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="space-y-4">
                <button
                  onClick={() => setShowExpertSettings(!showExpertSettings)}
                  className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${showExpertSettings ? 'rotate-90' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Zeige Experten Einstellungen</span>
                </button>
                
                {showExpertSettings && (
                  <div className="animate-slide-up">
                    <AttributeSelector
                      availableAttributes={AVAILABLE_ATTRIBUTES}
                      selectedAttributes={selectedAttributes}
                      onSelectionChange={handleAttributeSelection}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              {isSyncing || syncResults.length > 0 ? (
                <SyncProgress
                  results={syncResults}
                  totalUsers={selectedUsers.size}
                  isComplete={syncComplete}
                  isDryRun={isDryRun}
                  onRunActualSync={isDryRun && syncComplete ? () => handleSync(false) : undefined}
                />
              ) : (
                <div className="card p-6">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                          Synchronisation starten
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {selectedUsers.size > 0 
                            ? `${selectedUsers.size} Benutzer ausgewählt`
                            : 'Wählen Sie Benutzer zur Synchronisation aus'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center w-full lg:w-auto lg:min-w-80">
                      <button
                        onClick={() => handleSync(false)}
                        disabled={!canSync}
                        className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                          canSync 
                            ? 'btn-primary shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isSyncing ? 'Synchronisiere...' : 'Synchronisation starten'}
                      </button>
                    </div>
                  </div>
                  
                  
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => onUsersLoaded([])}
                      className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      ← Andere Datei hochladen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <UserList
            users={users}
            selectedUsers={selectedUsers}
            onSelectionChange={handleUserSelection}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            currentUserSchoolId={currentUserSchoolId}
          />
        </>
      )}
    </div>
  );
}