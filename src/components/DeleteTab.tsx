'use client';

import { useState, useCallback } from 'react';
import { User, KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';
import UserList from './UserList';

interface DeleteTabProps {
  keycloakConfig: KeycloakConfig;
  xmlUsers: User[];
  isKeycloakAuthenticated: boolean;
}

interface DeleteResult {
  userId: string;
  success: boolean;
  error?: string;
}

export default function DeleteTab({ keycloakConfig, xmlUsers, isKeycloakAuthenticated }: DeleteTabProps) {
  const [keycloakUsers, setKeycloakUsers] = useState<User[]>([]);
  const [usersToDelete, setUsersToDelete] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResults, setDeleteResults] = useState<DeleteResult[]>([]);
  const [deleteComplete, setDeleteComplete] = useState(false);

  const findOldUsers = useCallback(async () => {
    if (!isKeycloakAuthenticated) {
      alert('Bitte authentifizieren Sie sich zuerst mit Keycloak.');
      return;
    }

    setIsLoading(true);
    try {
      const client = new KeycloakClient(keycloakConfig);
      await client.authenticate();
      
      const allKeycloakUsers = await client.getAllUsers();
      setKeycloakUsers(allKeycloakUsers);

      // Find users in Keycloak that are not in the current XML
      const xmlEmails = new Set(xmlUsers.map(u => u.email.toLowerCase()));
      const obsoleteUsers = allKeycloakUsers.filter(user => {
        return user.email && !xmlEmails.has(user.email.toLowerCase());
      });

      setUsersToDelete(obsoleteUsers);
      setSelectedUsers(new Set());
      setDeleteResults([]);
      setDeleteComplete(false);
    } catch (error) {
      alert(`Fehler beim Laden der Benutzer: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsLoading(false);
    }
  }, [keycloakConfig, xmlUsers, isKeycloakAuthenticated]);

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
  }, []);

  const handleSelectAll = useCallback((filteredUsers: User[]) => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const handleDeleteUsers = useCallback(async (dryRun: boolean = false) => {
    const selectedUsersList = usersToDelete.filter(u => selectedUsers.has(u.id));
    if (selectedUsersList.length === 0) {
      alert('Bitte wählen Sie mindestens einen Benutzer zum Löschen aus.');
      return;
    }

    if (!dryRun) {
      const confirmDelete = confirm(`Sind Sie sicher, dass Sie ${selectedUsersList.length} Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`);
      if (!confirmDelete) return;
    }

    setIsDeleting(true);
    setDeleteResults([]);
    setDeleteComplete(false);

    try {
      const client = new KeycloakClient(keycloakConfig);
      if (!dryRun) {
        await client.authenticate();
      }

      const results: DeleteResult[] = [];

      for (const user of selectedUsersList) {
        try {
          const success = await client.deleteUser(user.id, dryRun);
          results.push({
            userId: user.id,
            success,
            error: success ? undefined : 'Löschung fehlgeschlagen',
          });
        } catch (error) {
          results.push({
            userId: user.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          });
        }
        
        setDeleteResults([...results]);
      }

      setDeleteComplete(true);
      
      if (!dryRun) {
        // Refresh the list after successful deletion
        setTimeout(() => {
          findOldUsers();
        }, 1000);
      }
    } catch (error) {
      alert(`Löschvorgang fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsDeleting(false);
    }
  }, [keycloakConfig, usersToDelete, selectedUsers, findOldUsers]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Veraltete Benutzer löschen
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Finden und löschen Sie Benutzer, die nicht mehr in der XML-Datei vorhanden sind
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={findOldUsers}
            disabled={isLoading || xmlUsers.length === 0 || !isKeycloakAuthenticated}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              isLoading || xmlUsers.length === 0 || !isKeycloakAuthenticated
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Lade Benutzer...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Veraltete Benutzer finden
              </>
            )}
          </button>

          {usersToDelete.length > 0 && selectedUsers.size > 0 && (
            <>
              <button
                onClick={() => handleDeleteUsers(true)}
                disabled={isDeleting}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Testlauf
              </button>
              <button
                onClick={() => handleDeleteUsers(false)}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? 'Lösche...' : 'Benutzer löschen'}
              </button>
            </>
          )}
        </div>

        {xmlUsers.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Bitte laden Sie zuerst eine XML-Datei im Import-Tab, um veraltete Benutzer zu identifizieren.
            </p>
          </div>
        )}

        {!isKeycloakAuthenticated && xmlUsers.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">
              Keycloak-Authentifizierung erforderlich. Bitte konfigurieren Sie Keycloak in der Seitenleiste.
            </p>
          </div>
        )}
      </div>

      {usersToDelete.length > 0 && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Gefundene veraltete Benutzer
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Diese {usersToDelete.length} Benutzer sind in Keycloak vorhanden, aber nicht in der aktuellen XML-Datei:
            </p>
          </div>

          <UserList
            users={usersToDelete}
            selectedUsers={selectedUsers}
            onSelectionChange={handleUserSelection}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </div>
      )}

      {deleteResults.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Löschvorgang Ergebnisse
          </h3>
          <div className="space-y-2">
            {deleteResults.map((result) => {
              const user = usersToDelete.find(u => u.id === result.userId);
              return (
                <div key={result.userId} className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                  <span className="font-medium">
                    {user?.firstName} {user?.lastName} ({user?.email})
                  </span>
                  <span className="text-sm">
                    {result.success ? 'Erfolgreich gelöscht' : result.error}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}