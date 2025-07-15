'use client';

import { useState, useEffect, useCallback } from 'react';
import { KeycloakConfig } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';

interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  enabled: boolean;
  createdTimestamp: number;
  attributes?: Record<string, string[]>;
}

interface UsersTabProps {
  keycloakConfig: KeycloakConfig;
  isKeycloakAuthenticated: boolean;
}

const USERS_PER_PAGE = 20;

export default function UsersTab({ keycloakConfig, isKeycloakAuthenticated }: UsersTabProps) {
  const [users, setUsers] = useState<KeycloakUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const loadUsers = useCallback(async (page: number = 1, search: string = '') => {
    if (!isKeycloakAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const client = new KeycloakClient(keycloakConfig);
      const response = await fetch(
        `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users?` +
        new URLSearchParams({
          first: ((page - 1) * USERS_PER_PAGE).toString(),
          max: USERS_PER_PAGE.toString(),
          ...(search && { search }),
        }),
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('oauth2_access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const usersData = await response.json();
      
      // Get total count for pagination
      const countResponse = await fetch(
        `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/count?` +
        new URLSearchParams(search ? { search } : {}),
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('oauth2_access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const count = countResponse.ok ? await countResponse.json() : usersData.length;
      
      setUsers(usersData);
      setTotalUsers(count);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [keycloakConfig, isKeycloakAuthenticated]);

  useEffect(() => {
    loadUsers(1, searchTerm);
  }, [loadUsers, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    loadUsers(page, searchTerm);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.size === 0) return;
    
    setBulkActionLoading(true);
    setError(null);
    
    try {
      const client = new KeycloakClient(keycloakConfig);
      const userIds = Array.from(selectedUsers);
      
      for (const userId of userIds) {
        try {
          switch (action) {
            case 'activate':
              await client.activateUser(userId);
              break;
            case 'deactivate':
              await client.deactivateUser(userId);
              break;
            case 'delete':
              await client.deleteUser(userId);
              break;
          }
        } catch (err) {
          console.error(`Failed to ${action} user ${userId}:`, err);
        }
      }
      
      // Refresh the users list
      await loadUsers(currentPage, searchTerm);
      setSelectedUsers(new Set());
      
    } catch (err) {
      setError(`Bulk ${action} failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  if (!isKeycloakAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Keycloak-Anmeldung erforderlich
          </h3>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Bitte melden Sie sich zuerst bei Keycloak an, um die Benutzer anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                Keycloak Benutzer
              </h2>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {totalUsers} Benutzer gesamt
              </p>
            </div>
          </div>
          
          <button
            onClick={() => loadUsers(currentPage, searchTerm)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Benutzer suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-orange-200 dark:border-orange-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-stone-800 text-orange-900 dark:text-orange-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  {selectedUsers.size} Benutzer ausgewählt
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                disabled={bulkActionLoading}
                className="btn-secondary text-sm px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white border-green-600 hover:border-green-700"
              >
                {bulkActionLoading ? (
                  <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Aktivieren
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionLoading}
                className="btn-secondary text-sm px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white border-yellow-600 hover:border-yellow-700"
              >
                {bulkActionLoading ? (
                  <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                )}
                Deaktivieren
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
                className="btn-secondary text-sm px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white border-red-600 hover:border-red-700"
              >
                {bulkActionLoading ? (
                  <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-orange-600 dark:text-orange-400">Benutzer werden geladen...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 dark:bg-orange-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size > 0 && selectedUsers.size === users.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    E-Mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Typ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-200 dark:divide-orange-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-white">
                            {(user.firstName?.[0] || user.username[0] || '?').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                            {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-orange-900 dark:text-orange-100">
                        {user.email || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${user.enabled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {user.enabled ? 'Aktiv' : 'Deaktiviert'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${user.emailVerified ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                        <span className={`text-xs ${user.emailVerified ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                          {user.emailVerified ? 'E-Mail verifiziert' : 'E-Mail nicht verifiziert'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 dark:text-orange-400">
                      {new Date(user.createdTimestamp).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.attributes?.userType?.[0] === 'student' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {user.attributes?.userType?.[0] === 'student' ? 'Schüler' : 'Lehrkraft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Keine Benutzer gefunden
            </h3>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              {searchTerm ? 'Versuchen Sie einen anderen Suchbegriff.' : 'Es sind keine Benutzer in Keycloak vorhanden.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Zeige {((currentPage - 1) * USERS_PER_PAGE) + 1} bis {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} von {totalUsers} Benutzern
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 disabled:bg-orange-50 disabled:text-orange-300 text-orange-700 rounded transition-colors"
              >
                Zurück
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        page === currentPage
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 disabled:bg-orange-50 disabled:text-orange-300 text-orange-700 rounded transition-colors"
              >
                Weiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}