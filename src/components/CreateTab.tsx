'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { User, KeycloakConfig, SyncableAttribute } from '@/types';
import { KeycloakClient } from '@/lib/keycloakClient';
import { parseCSVFile, generateMappingReport, processCSVWithMapping, generateUserIdFromEmail } from '@/lib/csvParser';
import { requiresTeacherID, isValidSchILDID } from '@/lib/schoolData';
import { useUserProfile } from '@/contexts/UserProfileContext';
import CSVFieldMapper from './CSVFieldMapper';
import SyncProgress from './SyncProgress';

const AVAILABLE_ATTRIBUTES: SyncableAttribute[] = [
  { key: 'firstName', label: 'Vorname', required: true },
  { key: 'lastName', label: 'Nachname', required: true },
  { key: 'email', label: 'E-Mail-Adresse', required: true },
  { key: 'userType', label: 'Benutzertyp (Schüler/Lehrkraft)', required: true },
];

interface ManualUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'teacher';
  schildId?: string;
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
    { id: '1', firstName: '', lastName: '', email: '', userType: 'teacher', schildId: '' }
  ]);
  const { schulnummer: currentUserSchoolId } = useUserProfile();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [syncComplete, setSyncComplete] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [csvUploadStatus, setCsvUploadStatus] = useState<{
    isProcessing: boolean;
    error: string | null;
    lastMapping: string | null;
    importedCount: number;
  }>({ isProcessing: false, error: null, lastMapping: null, importedCount: 0 });
  const [fieldMappingDialog, setFieldMappingDialog] = useState<{
    isOpen: boolean;
    csvContent: string;
    headers: string[];
    autoMapping: Record<string, number>;
    sampleData: string[][];
  }>({ isOpen: false, csvContent: '', headers: [], autoMapping: {}, sampleData: [] });

  // Note: Current user's school information is now provided by the UserProfileContext

  const addRow = useCallback(() => {
    const newId = (Math.max(...manualUsers.map(u => parseInt(u.id))) + 1).toString();
    setManualUsers(prev => [...prev, {
      id: newId,
      firstName: '',
      lastName: '',
      email: '',
      userType: 'teacher',
      schildId: ''
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
    // Also reset CSV status when manual data changes
    setCsvUploadStatus(prev => ({ ...prev, error: null }));
  }, []);

  const handleCSVUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvUploadStatus({ isProcessing: true, error: null, lastMapping: null, importedCount: 0 });

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvUploadStatus({ isProcessing: false, error: 'Bitte wählen Sie eine CSV-Datei aus.', lastMapping: null, importedCount: 0 });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCsvUploadStatus({ isProcessing: false, error: 'Datei ist zu groß. Bitte wählen Sie eine Datei kleiner als 5MB.', lastMapping: null, importedCount: 0 });
      return;
    }

    try {
      const text = await file.text();
      const { users, mapping, errors, headers, sampleData, needsManualMapping } = parseCSVFile(text);
      
      // If automatic mapping is insufficient, show manual mapping dialog
      if (needsManualMapping) {
        setFieldMappingDialog({
          isOpen: true,
          csvContent: text,
          headers,
          autoMapping: mapping,
          sampleData
        });
        setCsvUploadStatus({ isProcessing: false, error: null, lastMapping: null, importedCount: 0 });
        return;
      }
      
      // Convert CSV users to manual users format
      const startId = Math.max(...manualUsers.map(u => parseInt(u.id)), 0) + 1;
      const newUsers = users.map((user, index) => ({
        id: user.id || (startId + index).toString(), // Use CSV ID if available, otherwise generate
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        schildId: user.schildId || ''
      }));

      // Add to existing users or replace if starting fresh
      if (manualUsers.length === 1 && !manualUsers[0].firstName && !manualUsers[0].lastName && !manualUsers[0].email) {
        // Replace the empty initial row
        setManualUsers(newUsers);
      } else {
        // Add to existing users
        setManualUsers(prev => [...prev, ...newUsers]);
      }

      // Generate mapping report
      const mappingReport = generateMappingReport(mapping, Object.keys(mapping));
      
      // Prepare status message
      let statusMessage = `${users.length} Benutzer erfolgreich importiert.`;
      if (errors.length > 0) {
        statusMessage += ` ${errors.length} Warnungen aufgetreten.`;
      }

      setCsvUploadStatus({
        isProcessing: false,
        error: errors.length > 0 ? errors.join('\n') : null,
        lastMapping: mappingReport,
        importedCount: users.length
      });

      // Reset sync state
      setSyncResults([]);
      setSyncComplete(false);

    } catch (error) {
      setCsvUploadStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Fehler beim Verarbeiten der CSV-Datei.',
        lastMapping: null,
        importedCount: 0
      });
    } finally {
      // Reset file input
      event.target.value = '';
    }
  }, [manualUsers]);

  const handleManualMapping = useCallback(async (customMapping: Record<string, number>) => {
    setCsvUploadStatus({ isProcessing: true, error: null, lastMapping: null, importedCount: 0 });
    
    try {
      const { users, errors } = processCSVWithMapping(fieldMappingDialog.csvContent, customMapping);
      
      // Convert CSV users to manual users format
      const startId = Math.max(...manualUsers.map(u => parseInt(u.id)), 0) + 1;
      const newUsers = users.map((user, index) => ({
        id: user.id || (startId + index).toString(), // Use CSV ID if available, otherwise generate
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        schildId: user.schildId || ''
      }));

      // Add to existing users or replace if starting fresh
      if (manualUsers.length === 1 && !manualUsers[0].firstName && !manualUsers[0].lastName && !manualUsers[0].email) {
        // Replace the empty initial row
        setManualUsers(newUsers);
      } else {
        // Add to existing users
        setManualUsers(prev => [...prev, ...newUsers]);
      }

      // Generate mapping report
      const mappingReport = generateMappingReport(customMapping, fieldMappingDialog.headers);
      
      setCsvUploadStatus({
        isProcessing: false,
        error: errors.length > 0 ? errors.join('\n') : null,
        lastMapping: mappingReport,
        importedCount: users.length
      });

      // Reset sync state
      setSyncResults([]);
      setSyncComplete(false);
      
      // Close dialog
      setFieldMappingDialog({ isOpen: false, csvContent: '', headers: [], autoMapping: {}, sampleData: [] });

    } catch (error) {
      setCsvUploadStatus({
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Fehler beim Verarbeiten der CSV-Datei.',
        lastMapping: null,
        importedCount: 0
      });
      setFieldMappingDialog({ isOpen: false, csvContent: '', headers: [], autoMapping: {}, sampleData: [] });
    }
  }, [fieldMappingDialog.csvContent, fieldMappingDialog.headers, manualUsers]);

  const handleMappingDialogClose = useCallback(() => {
    setFieldMappingDialog({ isOpen: false, csvContent: '', headers: [], autoMapping: {}, sampleData: [] });
    setCsvUploadStatus({ isProcessing: false, error: null, lastMapping: null, importedCount: 0 });
  }, []);

  const clearAllUsers = useCallback(() => {
    const confirmClear = confirm('Möchten Sie alle Benutzer aus der Tabelle entfernen?');
    if (confirmClear) {
      setManualUsers([{ id: '1', firstName: '', lastName: '', email: '', userType: 'teacher', schildId: '' }]);
      setSyncResults([]);
      setSyncComplete(false);
      setCsvUploadStatus({ isProcessing: false, error: null, lastMapping: null, importedCount: 0 });
    }
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
    return manualUsers.map(user => {
      // Check if user has a proper ID format (starts with ID- or contains 11 digits)
      const hasProperIdFormat = user.id.startsWith('ID-') || /^\d{11}$/.test(user.id.replace(/[^0-9]/g, ''));
      const hasSimpleNumericId = /^\d+$/.test(user.id);
      
      // Only generate ID if user doesn't have a proper ID and has a simple numeric ID
      const finalId = !hasProperIdFormat && hasSimpleNumericId ? generateUserIdFromEmail(user.email) : user.id;
      
      return {
        id: finalId,
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        email: user.email.trim().toLowerCase(),
        userType: user.userType,
        schildId: user.schildId?.trim() || `manual-${finalId}`,
        klasse: user.userType === 'student' ? 'Manual' : undefined
      };
    });
  }, []);

  const handleSync = async (dryRun: boolean = false) => {
    const validManualUsers = validateUsers();
    if (validManualUsers.length === 0) {
      alert('Bitte geben Sie mindestens einen gültigen Benutzer mit Name und E-Mail-Adresse ein.');
      return;
    }

    // Only allow teachers for sync - students cannot be synchronized
    const usersToSync = validManualUsers.filter(user => user.userType === 'teacher');
    
    if (usersToSync.length === 0) {
      alert('Nur Lehrkräfte können synchronisiert werden. Bitte wählen Sie mindestens eine Lehrkraft aus.');
      return;
    }

    // Check if school is public and requires teacher IDs
    if (currentUserSchoolId && requiresTeacherID(currentUserSchoolId)) {
      const teachersWithInvalidId = usersToSync.filter(teacher => !isValidSchILDID(teacher.schildId, currentUserSchoolId));
      if (teachersWithInvalidId.length > 0) {
        const teacherNames = teachersWithInvalidId.map(t => `${t.firstName} ${t.lastName}`).join(', ');
        alert(`Für öffentliche Schulen sind echte SchILD-IDs (nicht automatisch generierte) für alle Lehrkräfte erforderlich.\n\nFolgende Lehrkräfte haben keine gültige SchILD-ID und können nicht synchronisiert werden:\n${teacherNames}\n\nBitte geben Sie echte SchILD-IDs ein oder verwenden Sie den XML-Import für öffentliche Schulen.`);
        return;
      }
    }

    if (!keycloakConfig.url || !keycloakConfig.realm || !keycloakConfig.clientId || !keycloakConfig.redirectUri) {
      alert('Bitte füllen Sie alle Keycloak-Konfigurationsfelder aus.');
      return;
    }
    if (!isKeycloakAuthenticated) {
      alert('Bitte melden Sie sich zuerst bei Keycloak an.');
      return;
    }

    setIsSyncing(true);
    setSyncResults([]);
    setSyncComplete(false);
    setIsDryRun(false);

    const client = new KeycloakClient(keycloakConfig);
    const usersToProcess = usersToSync;
    const convertedUsers = convertToUsers(usersToProcess);

    try {
      // OAuth2 authentication is handled globally, token is stored in session
      // No need to authenticate here - the client will use the stored token

      const results: SyncResult[] = [];

      for (const user of convertedUsers) {
        try {
          const result = await client.syncUser(user, AVAILABLE_ATTRIBUTES, false);
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
      alert(`Synchronisation fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
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
                Geben Sie Benutzerdaten direkt ein oder importieren Sie eine CSV-Datei
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="btn-secondary text-sm px-3 py-2 cursor-pointer inline-flex items-center whitespace-nowrap">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {csvUploadStatus.isProcessing ? 'Verarbeite...' : 'CSV importieren'}
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={csvUploadStatus.isProcessing}
                className="hidden"
              />
            </label>
            <button
              onClick={addRow}
              className="btn-primary text-sm px-3 py-2 inline-flex items-center whitespace-nowrap"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Zeile hinzufügen
            </button>
            {manualUsers.length > 1 && (
              <button
                onClick={clearAllUsers}
                className="text-red-600 hover:text-red-700 text-sm px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex items-center whitespace-nowrap"
                title="Alle Benutzer löschen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

            {/* CSV Upload Status */}
            {csvUploadStatus.importedCount > 0 && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 dark:text-green-200">
                    {csvUploadStatus.importedCount} Benutzer aus CSV importiert
                  </span>
                </div>
                {csvUploadStatus.lastMapping && (
                  <details className="mt-2">
                    <summary className="text-xs text-green-700 dark:text-green-300 cursor-pointer hover:text-green-800 dark:hover:text-green-200">
                      Felderzuordnung anzeigen
                    </summary>
                    <pre className="mt-2 text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap font-mono">
                      {csvUploadStatus.lastMapping}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {csvUploadStatus.error && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">CSV Import Warnungen:</h4>
                    <pre className="text-xs text-amber-700 dark:text-amber-300 whitespace-pre-wrap">{csvUploadStatus.error}</pre>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Vorname</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Nachname</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">E-Mail</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">SchILD-ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">ID</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Typ</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-slate-600 dark:text-slate-400">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {manualUsers.map((user, index) => {
                    const isValid = user.firstName.trim() && user.lastName.trim() && user.email.trim() && user.email.includes('@');
                    const isSyncable = isValid && user.userType === 'teacher';
                    // Generate display ID - check if user has proper ID format first
                    const hasProperIdFormat = user.id.startsWith('ID-') || /^\d{11}$/.test(user.id.replace(/[^0-9]/g, ''));
                    const hasSimpleNumericId = /^\d+$/.test(user.id);
                    const displayId = !hasProperIdFormat && hasSimpleNumericId && user.email.trim() ? generateUserIdFromEmail(user.email) : user.id;
                    
                    return (
                      <tr key={user.id} className={`border-b border-slate-100 dark:border-slate-800 ${
                        user.userType === 'student' ? 'opacity-60 bg-amber-50 dark:bg-amber-900/10' : ''
                      }`}>
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
                          <input
                            type="text"
                            value={user.schildId || ''}
                            onChange={(e) => updateUser(user.id, 'schildId', e.target.value)}
                            placeholder={currentUserSchoolId && requiresTeacherID(currentUserSchoolId) ? "Erforderlich für öffentliche Schulen" : "Optional"}
                            className={`w-full px-2 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:border-transparent ${
                              currentUserSchoolId && requiresTeacherID(currentUserSchoolId) && user.userType === 'teacher' && !isValidSchILDID(user.schildId, currentUserSchoolId)
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                                : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                            }`}
                          />
                          {currentUserSchoolId && requiresTeacherID(currentUserSchoolId) && user.userType === 'teacher' && !isValidSchILDID(user.schildId, currentUserSchoolId) && (
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Echte SchILD-ID erforderlich
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-2 rounded border">
                            {displayId}
                            {!hasProperIdFormat && hasSimpleNumericId && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Generiert
                              </div>
                            )}
                            {hasProperIdFormat && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Übernommen
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={user.userType}
                            onChange={(e) => updateUser(user.id, 'userType', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="teacher">Lehrkraft</option>
                            <option value="student">Schüler</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              user.userType === 'student' 
                                ? 'bg-amber-500' 
                                : isSyncable 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                            }`} title={
                              user.userType === 'student' 
                                ? 'Schüler - Nicht synchronisierbar' 
                                : isSyncable 
                                  ? 'Synchronisierbar' 
                                  : 'Unvollständig'
                            } />
                            {user.userType === 'student' && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                Nicht synchronisierbar
                              </span>
                            )}
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
                    {validUsers.length} gültige Benutzer eingegeben • {teacherCount} Lehrkräfte können synchronisiert werden
                  </span>
                </div>
              </div>
            )}

        </div>

        {/* Sync Section */}
        <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
          {isSyncing || syncResults.length > 0 ? (
            <SyncProgress
              results={syncResults}
              totalUsers={isDryRun ? validUsers.length : teacherCount}
              isComplete={syncComplete}
              isDryRun={isDryRun}
              onRunActualSync={isDryRun && syncComplete ? () => handleSync(false) : undefined}
            />
          ) : (
            <div className="card p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Benutzer erstellen
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {validUsers.length > 0 
                        ? `${validUsers.length} Benutzer bereit`
                        : 'Geben Sie Benutzerdaten in die Tabelle ein'
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
                    {isSyncing ? 'Erstelle...' : 'Benutzer erstellen'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CSV Field Mapping Dialog */}
        <CSVFieldMapper
          isOpen={fieldMappingDialog.isOpen}
          onClose={handleMappingDialogClose}
          onConfirm={handleManualMapping}
          headers={fieldMappingDialog.headers}
          autoMapping={fieldMappingDialog.autoMapping}
          sampleData={fieldMappingDialog.sampleData}
        />
      </div>
    );
  }