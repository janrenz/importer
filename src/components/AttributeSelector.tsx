'use client';

import { SyncableAttribute } from '@/types';

interface AttributeSelectorProps {
  availableAttributes: SyncableAttribute[];
  selectedAttributes: Set<string>;
  onSelectionChange: (attributeKey: string, selected: boolean) => void;
}

export default function AttributeSelector({ 
  availableAttributes, 
  selectedAttributes, 
  onSelectionChange 
}: AttributeSelectorProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sync Attributes
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose attributes to synchronize
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {availableAttributes.map((attribute, index) => (
          <div key={attribute.key} className="animate-fade-in" style={{animationDelay: `${index * 0.05}s`}}>
            <label className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selectedAttributes.has(attribute.key) || attribute.required
                ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            } ${attribute.required ? 'opacity-75' : ''}`}>
              <input
                type="checkbox"
                checked={selectedAttributes.has(attribute.key) || attribute.required}
                onChange={(e) => onSelectionChange(attribute.key, e.target.checked)}
                disabled={attribute.required}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50"
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {attribute.label}
                  </span>
                  {attribute.required && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                      Required
                    </span>
                  )}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">Attribute Info</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Required attributes are automatically included. Optional attributes will be stored as custom user attributes in Keycloak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}