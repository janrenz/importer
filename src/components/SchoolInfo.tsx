'use client';

import { findSchoolByNumber, getSchulformColor, getRechtstatusColor, SchoolInfo } from '@/lib/schoolData';

interface SchoolInfoProps {
  schulnummer: string | number | undefined;
  className?: string;
}

export default function SchoolInfo({ schulnummer, className = '' }: SchoolInfoProps) {
  if (!schulnummer) {
    return null;
  }

  const schoolInfo = findSchoolByNumber(schulnummer);

  if (!schoolInfo) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Schule: {schulnummer}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          (Nicht in Datenbank gefunden)
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* School Number */}
      <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {schoolInfo.Schulnummer}
        </span>
      </div>

      {/* School Form */}
      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getSchulformColor(schoolInfo.Schulform)}`}>
        {schoolInfo.Schulform}
      </div>

      {/* Legal Status */}
      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getRechtstatusColor(schoolInfo.Rechtsstatus)}`}>
        {schoolInfo.Rechtsstatus}
      </div>
    </div>
  );
}