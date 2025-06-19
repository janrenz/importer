'use client';

import { useState } from 'react';

interface SchoolInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  email: string;
  fax?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  provider: string;
  school_type: string;
  website?: string;
  zip: string;
  update_timestamp: string;
}

interface PrincipalRegistrationProps {
  onBack: () => void;
}

type RegistrationStep = 'input' | 'school-info' | 'confirmation' | 'result';

interface AccountCreationResult {
  status: 'exists' | 'created';
  message: string;
}

export default function PrincipalRegistration({ onBack }: PrincipalRegistrationProps) {
  const [step, setStep] = useState<RegistrationStep>('input');
  const [schoolNumber, setSchoolNumber] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMailboxAccess, setHasMailboxAccess] = useState(false);
  const [result, setResult] = useState<AccountCreationResult | null>(null);

  const fetchSchoolInfo = async () => {
    if (!schoolNumber.trim()) {
      setError('Bitte geben Sie eine Schulnummer ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const schoolId = `NW-${schoolNumber.trim()}`;
      const response = await fetch(`https://jedeschule.codefor.de/schools/${schoolId}?include_raw=false`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Schule mit dieser Nummer nicht gefunden');
        }
        throw new Error('Fehler beim Laden der Schulinformationen');
      }

      const data: SchoolInfo = await response.json();
      setSchoolInfo(data);
      setStep('school-info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const createPrincipalAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API endpoint once implemented
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate API response - randomly return 'exists' or 'created'
      const mockResult: AccountCreationResult = Math.random() > 0.5 
        ? { status: 'created', message: 'Schulleiter-Account wurde erfolgreich erstellt' }
        : { status: 'exists', message: 'Ein Schulleiter-Account für diese Schule existiert bereits' };
      
      setResult(mockResult);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen des Accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setSchoolNumber('');
    setSchoolInfo(null);
    setError(null);
    setHasMailboxAccess(false);
    setResult(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Schulnummer *
              </label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                      NW-
                    </span>
                    <input
                      type="text"
                      value={schoolNumber}
                      onChange={(e) => setSchoolNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && fetchSchoolInfo()}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="192016"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Geben Sie die 6-stellige Schulnummer ohne "NW-" Präfix ein
                  </p>
                </div>
                <button
                  onClick={fetchSchoolInfo}
                  disabled={loading || !schoolNumber.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Suchen'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Schulnummer finden
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed mb-2">
                    Die Schulnummer steht in SchILD unter "Extras → Schule bearbeiten" oder kann bei der Bezirksregierung erfragt werden.
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    Alternativ können Sie Ihre Schulnummer auch in der{' '}
                    <a 
                      href="https://www.schulministerium.nrw.de/BiPo/SchuleSuchen/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:no-underline font-medium"
                    >
                      offiziellen Schuldatenbank des Schulministeriums NRW
                    </a>{' '}
                    nachschlagen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'school-info':
        return (
          <div className="space-y-6">
            <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3 mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    Schule gefunden
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Bitte überprüfen Sie, ob dies die korrekte Schule ist:
                  </p>
                </div>
              </div>

              {schoolInfo && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">Name:</span>
                    <span className="ml-2 text-green-800 dark:text-green-200">{schoolInfo.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">Adresse:</span>
                    <span className="ml-2 text-green-800 dark:text-green-200">
                      {schoolInfo.address}, {schoolInfo.zip} {schoolInfo.city}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">Schultyp:</span>
                    <span className="ml-2 text-green-800 dark:text-green-200">{schoolInfo.school_type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">Träger:</span>
                    <span className="ml-2 text-green-800 dark:text-green-200">{schoolInfo.provider}</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-900 dark:text-green-100">E-Mail:</span>
                    <span className="ml-2 text-green-800 dark:text-green-200">{schoolInfo.email}</span>
                  </div>
                  {schoolInfo.phone && (
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Telefon:</span>
                      <span className="ml-2 text-green-800 dark:text-green-200">{schoolInfo.phone}</span>
                    </div>
                  )}
                  {schoolInfo.website && (
                    <div>
                      <span className="font-medium text-green-900 dark:text-green-100">Website:</span>
                      <a 
                        href={schoolInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-green-700 dark:text-green-300 hover:underline"
                      >
                        {schoolInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={hasMailboxAccess}
                  onChange={(e) => setHasMailboxAccess(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ich bestätige, dass dies die korrekte Schule ist und ich Zugriff auf das Schulmailpostfach haben
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Der Administrator-Account wird an die offizielle Schulmail-Adresse ({schoolInfo?.email}) gesendet
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setStep('input')}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Andere Schule
              </button>
              <button
                onClick={() => setStep('confirmation')}
                disabled={!hasMailboxAccess}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <span>Weiter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Account erstellen
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Sind Sie bereit, den Schulleiter-Account anzulegen?
              </p>
            </div>

            <div className="card p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-3">
                Was passiert beim Erstellen des Accounts:
              </h4>
              <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>Ein Administrator-Account wird für {schoolInfo?.name} erstellt</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>Eine E-Mail mit Anmeldedaten wird an {schoolInfo?.email} gesendet</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>Sie erhalten ein temporäres Passwort, das beim ersten Login geändert werden muss</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>Der Account erhält Admin-Rechte für alle Benutzer Ihrer Schule</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setStep('school-info')}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Zurück
              </button>
              <button
                onClick={createPrincipalAccount}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Erstelle Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Schulleiter Account anlegen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                result?.status === 'created' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {result?.status === 'created' ? (
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {result?.status === 'created' ? 'Account erstellt!' : 'Account bereits vorhanden'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {result?.message}
              </p>
            </div>

            {result?.status === 'created' && (
              <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      Nächste Schritte:
                    </h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• Prüfen Sie Ihr E-Mail-Postfach ({schoolInfo?.email})</li>
                      <li>• Folgen Sie den Anweisungen in der E-Mail</li>
                      <li>• Vergeben Sie sich ein sicheres Passwort beim ersten Login</li>
                      <li>• Kommen Sie dann zu dieser Anwendung zurück und konfigurieren Sie die Keycloak-Verbindung</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {result?.status === 'exists' && (
              <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Was nun?
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Nutzen Sie die bestehenden Anmeldedaten oder kontaktieren Sie den Support, falls Sie keinen Zugriff mehr haben.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={handleReset}
                className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
              >
                Neue Schule einrichten
              </button>
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Zur Startseite</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Schulleiter einrichten
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Erstellen Sie einen Administrator-Account für die Schulleitung
        </p>
      </div>

      <div className="card p-6 space-y-6">
        {renderStep()}
      </div>

      {step === 'input' && (
        <div className="flex items-center justify-end space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 font-medium transition-colors"
          >
            Zurück
          </button>
        </div>
      )}
    </div>
  );
}