'use client';

interface SyncResult {
  userId: string;
  success: boolean;
  existed: boolean;
  error?: string;
}

interface SyncProgressProps {
  results: SyncResult[];
  totalUsers: number;
  isComplete: boolean;
  isDryRun?: boolean;
  onRunActualSync?: () => void;
}

export default function SyncProgress({ results, totalUsers, isComplete, isDryRun = false, onRunActualSync }: SyncProgressProps) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const created = results.filter(r => r.success && !r.existed).length;
  const alreadyExisted = results.filter(r => r.success && r.existed).length;
  const progress = (results.length / totalUsers) * 100;

  return (
    <div className="card p-6 animate-bounce-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isDryRun ? 'Testlauf-Fortschritt' : 'Synchronisations-Fortschritt'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Benutzerdaten werden verarbeitet
            </p>
          </div>
        </div>
        {isDryRun && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            TEST MODE
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            <span>Fortschritt</span>
            <span>{results.length} / {totalUsers}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{created}</div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Erstellt</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{alreadyExisted}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Bereits vorhanden</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failed}</div>
            <div className="text-sm text-red-700 dark:text-red-300 font-medium">Fehlgeschlagen</div>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{totalUsers - results.length}</div>
            <div className="text-sm text-slate-700 dark:text-slate-400 font-medium">Verbleibend</div>
          </div>
        </div>
        
        {isComplete && (
          <div className={`p-4 rounded-xl border animate-slide-up ${
            failed === 0 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {failed === 0 ? (
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className={`text-sm font-medium mb-1 ${
                  failed === 0 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-amber-900 dark:text-amber-100'
                }`}>
                  {failed === 0 ? 'Success!' : 'Completed with Issues'}
                </h4>
                <p className={`text-sm ${
                  failed === 0 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {failed === 0 
                    ? (isDryRun ? 'Test run completed successfully!' : 'All users synced successfully!')
                    : (isDryRun ? `Test run completed with ${failed} simulated failures` : `Sync completed with ${failed} failures`)
                  }
                </p>
              </div>
            </div>
            
            {/* Show "Run Actual Sync" button after successful test run */}
            {isDryRun && isComplete && failed === 0 && onRunActualSync && (
              <div className="mt-4 animate-slide-up">
                <button
                  onClick={onRunActualSync}
                  className="w-full btn-primary text-sm py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Run Actual Sync to Keycloak
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Show retry button for test runs with failures */}
        {isDryRun && isComplete && failed > 0 && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Test Run Issues</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Some users had validation issues in the test run. Please review the errors above and adjust your selection or data before running the actual sync.
                </p>
                {onRunActualSync && (
                  <button
                    onClick={onRunActualSync}
                    className="btn-secondary text-sm px-4 py-2 rounded-lg"
                  >
                    Proceed with Actual Sync Anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {failed > 0 && (
          <div className="mt-6 animate-slide-up">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Failed Operations
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {results.filter(r => !r.success).map((result, index) => (
                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium text-red-900 dark:text-red-100">User {result.userId}:</span>
                    <span className="text-red-700 dark:text-red-300 ml-1">{result.error}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}