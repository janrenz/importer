'use client';

import { useCallback, useState } from 'react';
import { User } from '@/types';
import { parseXMLFile } from '@/lib/xmlParser';

interface FileUploadProps {
  onUsersLoaded: (users: User[]) => void;
}

export default function FileUpload({ onUsersLoaded }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setError('Please select an XML file.');
      setIsProcessing(false);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Please select a file smaller than 10MB.');
      setIsProcessing(false);
      return;
    }

    try {
      console.log('Reading file:', file.name, 'Size:', file.size, 'bytes');
      const text = await file.text();
      console.log('File content length:', text.length);
      console.log('First 200 characters:', text.substring(0, 200));
      
      const users = parseXMLFile(text);
      console.log('Parsed users:', users.length);
      
      if (users.length === 0) {
        setError('No valid users found in the XML file. Please ensure the file contains student or teacher data in the correct SchILD/Logineo format.');
        setIsProcessing(false);
        return;
      }
      
      onUsersLoaded(users);
    } catch (error) {
      console.error('Error parsing XML file:', error);
      let errorMessage = 'Unable to parse the XML file.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid XML format')) {
          errorMessage = 'The file contains invalid XML. Please check that the file is not corrupted.';
        } else {
          errorMessage = `Parsing error: ${error.message}`;
        }
      }
      
      errorMessage += ' Please ensure you have uploaded a valid SchILD/Logineo XML export file.';
      setError(errorMessage);
    }
    
    setIsProcessing(false);
    // Reset the input
    event.target.value = '';
  }, [onUsersLoaded]);

  return (
    <div className="relative">
      <div className={`card p-6 sm:p-8 text-center transition-all duration-300 border-2 border-dashed animate-bounce-in ${
        error 
          ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10' 
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
      }`}>
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-bounce-in ${
              isProcessing 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 animate-pulse' 
                : error
                ? 'bg-gradient-to-br from-red-500 to-red-600'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`} style={{animationDelay: '0.1s'}}>
              {isProcessing ? (
                <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : error ? (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {isProcessing ? 'Processing File...' : 'Upload XML File'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {isProcessing 
                ? 'Please wait while we process your XML file'
                : 'Select your SchILD/Logineo XML export file to import and sync user data with Keycloak'
              }
            </p>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-up">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">Upload Error</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative animate-slide-up" style={{animationDelay: '0.2s'}}>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <button 
              disabled={isProcessing}
              className={`text-base px-8 py-4 rounded-xl shadow-lg font-medium transition-all duration-200 ${
                isProcessing 
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'btn-primary hover:shadow-xl transform hover:scale-105'
              }`}
            >
              <svg className={`w-5 h-5 mr-2 inline ${isProcessing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isProcessing ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M12 4v16m8-8H4"} />
              </svg>
              {isProcessing ? 'Processing...' : 'Choose File'}
            </button>
          </div>
          
          {!isProcessing && !error && (
            <div className="flex items-center justify-center space-x-6 pt-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>XML Format</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>SchILD/Logineo</span>
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