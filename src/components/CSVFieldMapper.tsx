'use client';

import React, { useState, useEffect } from 'react';

interface CSVFieldMapperProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mapping: Record<string, number>) => void;
  headers: string[];
  autoMapping: Record<string, number>;
  sampleData: string[][];
}

const FIELD_DEFINITIONS = {
  firstName: {
    label: 'Vorname',
    description: 'Der Vorname des Benutzers',
    required: true,
    examples: ['Max', 'Anna', 'Peter']
  },
  lastName: {
    label: 'Nachname', 
    description: 'Der Nachname des Benutzers',
    required: true,
    examples: ['Mustermann', 'Schmidt', 'Müller']
  },
  email: {
    label: 'E-Mail',
    description: 'Die E-Mail-Adresse des Benutzers',
    required: false,
    examples: ['max@schule.de', 'anna@example.com']
  },
  userType: {
    label: 'Benutzertyp',
    description: 'Rolle: Lehrer oder Schüler',
    required: false,
    examples: ['Lehrer', 'Teacher', 'Student', 'Schüler']
  }
};

export default function CSVFieldMapper({ 
  isOpen, 
  onClose, 
  onConfirm, 
  headers, 
  autoMapping, 
  sampleData 
}: CSVFieldMapperProps) {
  const [mapping, setMapping] = useState<Record<string, number>>(autoMapping);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setMapping(autoMapping);
  }, [autoMapping]);

  if (!isOpen) return null;

  const updateMapping = (field: string, headerIndex: number) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      
      // Remove this header from other fields
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === headerIndex && key !== field) {
          delete newMapping[key];
        }
      });
      
      // Set or remove the mapping
      if (headerIndex === -1) {
        delete newMapping[field];
      } else {
        newMapping[field] = headerIndex;
      }
      
      return newMapping;
    });
  };

  const getUsedHeaders = () => {
    return new Set(Object.values(mapping));
  };

  const isValidMapping = () => {
    // At least firstName OR lastName must be mapped
    return mapping.firstName !== undefined || mapping.lastName !== undefined;
  };

  const usedHeaders = getUsedHeaders();

  const renderPreviewData = () => {
    return sampleData.slice(0, 3).map((row, rowIndex) => (
      <tr key={rowIndex} className="border-b border-slate-200 dark:border-slate-700">
        <td className="py-2 px-3 text-sm text-slate-600 dark:text-slate-400">
          Zeile {rowIndex + 2}
        </td>
        <td className="py-2 px-3 text-sm">
          {mapping.firstName !== undefined ? row[mapping.firstName] || '-' : '-'}
        </td>
        <td className="py-2 px-3 text-sm">
          {mapping.lastName !== undefined ? row[mapping.lastName] || '-' : '-'}
        </td>
        <td className="py-2 px-3 text-sm">
          {mapping.email !== undefined ? row[mapping.email] || '-' : '-'}
        </td>
        <td className="py-2 px-3 text-sm">
          {mapping.userType !== undefined ? row[mapping.userType] || 'teacher' : 'teacher'}
        </td>
      </tr>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                CSV-Felder zuordnen
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Ordnen Sie die CSV-Spalten den entsprechenden Benutzerfeldern zu
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Field Mapping */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Felderzuordnung
              </h3>
              <div className="space-y-4">
                {Object.entries(FIELD_DEFINITIONS).map(([fieldKey, fieldDef]) => (
                  <div key={fieldKey} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {fieldDef.label}
                        {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>
                    <select
                      value={mapping[fieldKey] ?? -1}
                      onChange={(e) => updateMapping(fieldKey, parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={-1}>-- Nicht zuordnen --</option>
                      {headers.map((header, index) => (
                        <option 
                          key={index} 
                          value={index}
                          disabled={usedHeaders.has(index) && mapping[fieldKey] !== index}
                        >
                          {header} {usedHeaders.has(index) && mapping[fieldKey] !== index ? '(bereits verwendet)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {fieldDef.description}
                    </p>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Beispiele: {fieldDef.examples.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {!isValidMapping() && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-red-800 dark:text-red-200">
                      Mindestens Vorname oder Nachname muss zugeordnet werden.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Vorschau
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {showPreview ? 'Ausblenden' : 'Datenvorschau anzeigen'}
                </button>
              </div>

              {/* Headers Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  CSV-Spalten ({headers.length})
                </h4>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {index + 1}. {header}
                      </span>
                      {usedHeaders.has(index) && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                          Zugeordnet
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              {showPreview && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Importvorschau (erste 3 Zeilen)
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-600">
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Zeile</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Vorname</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Nachname</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">E-Mail</th>
                          <th className="text-left py-2 px-3 text-slate-700 dark:text-slate-300">Typ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderPreviewData()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {Object.keys(mapping).length} von {Object.keys(FIELD_DEFINITIONS).length} Feldern zugeordnet
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => onConfirm(mapping)}
                disabled={!isValidMapping()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isValidMapping()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                Import durchführen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}