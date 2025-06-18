'use client';

import { useState } from 'react';
import { KeycloakConfig } from '@/types';

interface KeycloakConfigProps {
  config: KeycloakConfig;
  onConfigChange: (config: KeycloakConfig) => void;
}

export default function KeycloakConfigComponent({ config, onConfigChange }: KeycloakConfigProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: keyof KeycloakConfig, value: string) => {
    onConfigChange({ ...config, [field]: value });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Keycloak Configuration
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Connect to your Keycloak instance
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="keycloak-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Keycloak URL
            </label>
            <input
              type="url"
              id="keycloak-url"
              value={config.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://keycloak.example.com"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="realm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Realm
            </label>
            <input
              type="text"
              id="realm"
              value={config.realm}
              onChange={(e) => handleChange('realm', e.target.value)}
              placeholder="master"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="client-id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Client ID
            </label>
            <input
              type="text"
              id="client-id"
              value={config.clientId}
              onChange={(e) => handleChange('clientId', e.target.value)}
              placeholder="admin-cli"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={config.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="admin"
              className="block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={config.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="block w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100 sm:text-sm transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">Security Notice</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Configuration is stored only in your browser session. Never share credentials or commit them to version control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}