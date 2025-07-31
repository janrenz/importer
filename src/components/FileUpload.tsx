'use client';

import { useCallback, useState, useEffect } from 'react';
import { User } from '@/types';
import { parseXMLFileSecure } from '@/lib/secureXmlParser';
import { SECURITY_LIMITS, securityUtils } from '@/types/security';

interface FileUploadProps {
  onUsersLoaded: (users: User[], warnings?: string[]) => void;
  hasLoadedUsers?: boolean;
}

export default function FileUpload({ onUsersLoaded, hasLoadedUsers = false }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(!hasLoadedUsers);

  // Update isExpanded when hasLoadedUsers changes
  useEffect(() => {
    setIsExpanded(!hasLoadedUsers);
  }, [hasLoadedUsers]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setWarnings([]);
    setIsProcessing(true);

    try {
      // Enhanced security validation
      
      // 1. File type validation with MIME type check
      const allowedTypes = ['text/xml', 'application/xml'];
      const allowedExtensions = ['.xml'];
      
      if (!securityUtils.validateFileType(file, allowedTypes) && 
          !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        throw new Error('Nur XML-Dateien sind erlaubt. Bitte wählen Sie eine gültige XML-Datei aus.');
      }

      // 2. File size validation using security constants
      if (file.size > SECURITY_LIMITS.MAX_FILE_SIZE) {
        throw new Error(`Datei ist zu groß. Maximum erlaubt: ${Math.round(SECURITY_LIMITS.MAX_FILE_SIZE / 1024 / 1024)}MB`);
      }

      // 3. File name validation and sanitization
      const sanitizedFilename = securityUtils.sanitizeFilename(file.name);
      if (sanitizedFilename !== file.name) {
        setWarnings(prev => [...prev, 'Dateiname wurde für Sicherheit bereinigt']);
      }

      // 4. Check for minimum file size (empty or too small files)
      if (file.size < 100) {
        throw new Error('Datei ist zu klein oder leer. Bitte wählen Sie eine gültige SchILD XML-Datei aus.');
      }

      // 5. Secure context validation
      if (!securityUtils.isSecureContext()) {
        setWarnings(prev => [...prev, 'Warnung: Unsichere Verbindung erkannt. Für Produktionsumgebung HTTPS verwenden.']);
      }

      // 6. Read and validate file content
      const text = await file.text();
      
      // 7. Additional content-based validation
      if (text.length === 0) {
        throw new Error('Datei ist leer.');
      }

      // 8. Basic XML structure validation
      if (!text.trim().startsWith('<?xml') && !text.trim().startsWith('<')) {
        throw new Error('Datei scheint kein gültiges XML zu sein.');
      }

      // 9. Use secure XML parser
      const parseResult = parseXMLFileSecure(text);
      const users = parseResult.users;
      const parseWarnings = parseResult.warnings;
      
      // 10. Combine warnings
      const allWarnings = [...warnings, ...parseWarnings];
      setWarnings(allWarnings);
      
      if (users.length === 0) {
        throw new Error('Keine gültigen Benutzer in der XML-Datei gefunden. Stellen Sie sicher, dass die Datei Schüler- oder Lehrkraft-Daten im korrekten SchILD-Format enthält.');
      }
      
      // Log safely (only in development and without sensitive data)
      if (process.env.NODE_ENV === 'development') {
        console.log('File processed successfully:', {
          filename: sanitizedFilename,
          size: file.size,
          userCount: users.length,
          warningCount: allWarnings.length
        });
      }
      
      onUsersLoaded(users, allWarnings);
      
    } catch (error) {
      // Secure error handling
      let errorMessage = 'XML-Datei konnte nicht verarbeitet werden.';
      
      if (error instanceof Error) {
        // Only show specific error messages for known safe errors
        const safeErrorMessages = [
          'Security validation failed',
          'Invalid XML format',
          'Nur XML-Dateien sind erlaubt',
          'Datei ist zu groß',
          'Datei ist zu klein',
          'Datei ist leer',
          'Datei scheint kein gültiges XML zu sein',
          'Keine gültigen Benutzer',
          'Too many users in XML file'
        ];
        
        const isSafeError = safeErrorMessages.some(safe => error.message.includes(safe));
        
        if (isSafeError || process.env.NODE_ENV === 'development') {
          errorMessage = error.message;
        } else {
          errorMessage = 'Unbekannter Fehler beim Verarbeiten der XML-Datei.';
          // Log the full error for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.error('XML parsing error:', error);
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      // Reset the input for security (prevents file caching)
      event.target.value = '';
    }
  }, [onUsersLoaded]);

  // Show compact view when users are loaded
  if (hasLoadedUsers && !isExpanded) {
    return (
      <div className="relative">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full p-3 flex items-center justify-between hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-100">
                  XML-Datei geladen
                </h3>
                <p className="text-xs text-green-800 dark:text-green-200">
                  Klicken zum Laden einer neuen XML-Datei
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <span className="text-xs font-medium">Neue XML laden</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Show full upload interface
  return (
    <div className="relative">
      <div className={`card p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 border-2 border-dashed animate-bounce-in ${
        error 
          ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10' 
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
      }`}
      role="region"
      aria-labelledby="file-upload-heading"
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 animate-bounce-in ${
              isProcessing 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse' 
                : error
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`} style={{animationDelay: '0.1s'}}
            aria-hidden="true"
            >
              {isProcessing ? (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : error ? (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                </svg>
              )}
            </div>
            <h3 id="file-upload-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {isProcessing ? 'Datei wird verarbeitet...' : 'SchILD Export (XML) hochladen'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isProcessing 
                ? 'Bitte warten Sie, während wir Ihre XML-Datei verarbeiten'
                : 'Wählen Sie Ihre SchILD XML-Export-Datei aus, um Benutzerdaten zu importieren und mit Keycloak zu synchronisieren. Informationen zum Erstellen der Datei finden Sie im Hilfebereich.'
              }
            </p>
          </div>
          
          {error && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-up"
                 role="alert"
                 aria-labelledby="upload-error-title">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 id="upload-error-title" className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                    Upload-Fehler
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl animate-slide-up"
                 role="alert"
                 aria-labelledby="upload-warning-title">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 id="upload-warning-title" className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Sicherheitshinweise
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                    {warnings.map((warning, index) => (
                      <li key={index} className="mb-1 last:mb-0">• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative animate-slide-up" style={{animationDelay: '0.2s'}}>
            <input
              id="xml-file-input"
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-500/20"
              aria-describedby="file-constraints"
            />
            <button 
              disabled={isProcessing}
              className={`text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-lg font-medium transition-all duration-200 min-h-[44px] ${
                isProcessing 
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'btn-primary hover:shadow-xl transform hover:scale-105'
              }`}
              aria-describedby="file-constraints"
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 inline ${isProcessing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isProcessing ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M12 4v16m8-8H4"} />
              </svg>
              {isProcessing ? 'Verarbeitung...' : 'Datei auswählen'}
            </button>
          </div>
          
          {!isProcessing && !error && (
            <div className="flex items-center justify-center space-x-6 pt-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>XML-Format</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>SchILD</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Max 10MB</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}