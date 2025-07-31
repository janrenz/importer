'use client';

import { useState } from 'react';

type HelpTopic = 'support' | 'password-reset' | 'account-confirmation' | 'vidis-activation' | 'user-management' | 'getting-started' | 'troubleshooting' | 'teacher-account-help';

interface HelpTopicData {
  id: HelpTopic;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const helpTopics: HelpTopicData[] = [
  {
    id: 'getting-started',
    title: 'Erste Schritte',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Willkommen zur telli Nutzerverwaltung</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Diese Anwendung ermöglicht es Schulleitungen, einfach und sicher telli-Zugänge für Lehrkräfte ihrer Schule zu erstellen.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Schnellstart in 4 Schritten:</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">1</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Schulleiter-Account einrichten</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">Erstellen Sie zunächst einen Administrator-Account für die Schulleitung</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">2</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Anmelden</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">Melden Sie sich mit Ihrem bestätigten Schulleiter-Account an</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">3</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Lehrkräfte importieren</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">Importieren Sie Lehrkräfte aus SchiLD oder erstellen Sie sie manuell</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Nutzer verwalten</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">Verwalten Sie bestehende Accounts: aktivieren, deaktivieren oder löschen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'support',
    title: 'So erhalte ich Support',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Support erhalten</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Bei Fragen oder Problemen mit der telli Nutzerverwaltung stehen Ihnen verschiedene Supportkanäle zur Verfügung.
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Technischer Support
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Für technische Probleme und Fragen zur Nutzung der Anwendung:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>E-Mail:</strong> support@telli.nrw</p>
              <p><strong>Telefon:</strong> 0211 - 123 456 789</p>
              <p><strong>Zeiten:</strong> Mo-Fr 8:00-16:00 Uhr</p>
            </div>
          </div>
          
          <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Dokumentation
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Ausführliche Anleitungen und häufig gestellte Fragen:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Online-Hilfe:</strong> help.telli.nrw</p>
              <p><strong>FAQ-Bereich:</strong> Häufige Fragen und Antworten</p>
              <p><strong>Video-Tutorials:</strong> Schritt-für-Schritt Anleitungen</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Informationen für den Support</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            Um Ihnen schnell helfen zu können, halten Sie bitte folgende Informationen bereit:
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Schulnummer und Schulname</li>
            <li>• Beschreibung des Problems</li>
            <li>• Fehlermeldungen (falls vorhanden)</li>
            <li>• Browser und Version</li>
            <li>• Schritte zur Reproduktion des Problems</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'password-reset',
    title: 'Passwort zurücksetzen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Schulleiter-Account Passwort zurücksetzen</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Falls Sie Ihr Passwort für den Schulleiter-Account vergessen haben, können Sie es über das Anmeldeformular zurücksetzen.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Anmeldeseite aufrufen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Klicken Sie auf &quot;Keycloak Login&quot; und warten Sie bis die Anmeldeseite geladen ist.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">&quot;Passwort vergessen?&quot; anklicken</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Unterhalb des Anmeldeformulars finden Sie den Link "Passwort vergessen?". Klicken Sie darauf.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">E-Mail-Adresse eingeben</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Geben Sie die E-Mail-Adresse ein, die Sie bei der Registrierung verwendet haben.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">E-Mail prüfen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sie erhalten eine E-Mail mit einem Link zum Zurücksetzen des Passworts. Prüfen Sie auch Ihren Spam-Ordner.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">5</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Neues Passwort setzen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Klicken Sie auf den Link in der E-Mail und folgen Sie den Anweisungen zum Setzen eines neuen Passworts.
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Wichtige Hinweise
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            <li>• Der Reset-Link ist nur 24 Stunden gültig</li>
            <li>• Verwenden Sie ein sicheres Passwort (min. 8 Zeichen)</li>
            <li>• Falls Sie keine E-Mail erhalten, kontaktieren Sie den Support</li>
            <li>• Prüfen Sie, ob Sie die richtige E-Mail-Adresse eingegeben haben</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'account-confirmation',
    title: 'Schulleiter-Account bestätigen',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Schulleiter-Account bestätigen</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Nach der Registrierung müssen Sie Ihren Schulleiter-Account bestätigen, bevor Sie ihn verwenden können.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">1</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bestätigungs-E-Mail prüfen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nach der Registrierung erhalten Sie eine E-Mail mit einem Bestätigungslink. Prüfen Sie auch Ihren Spam-Ordner.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bestätigungslink anklicken</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Klicken Sie auf den Link in der E-Mail. Sie werden zur Bestätigungsseite weitergeleitet.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bestätigung abschließen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Folgen Sie den Anweisungen auf der Bestätigungsseite. Ihr Account wird sofort aktiviert.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">4</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Anmeldung testen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Kehren Sie zur Nutzerverwaltung zurück und testen Sie die Anmeldung mit Ihren Zugangsdaten.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Keine Bestätigungs-E-Mail erhalten?</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p>• Prüfen Sie Ihren Spam-/Junk-Mail-Ordner</p>
              <p>• Warten Sie bis zu 10 Minuten nach der Registrierung</p>
              <p>• Überprüfen Sie, ob Sie die richtige E-Mail-Adresse angegeben haben</p>
              <p>• Versuchen Sie, die E-Mail über das Anmeldeformular erneut anzufordern</p>
            </div>
          </div>
          
          <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Bestätigungslink funktioniert nicht?</h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p>• Der Link ist möglicherweise abgelaufen</p>
              <p>• Kopieren Sie den Link vollständig in die Adressleiste</p>
              <p>• Versuchen Sie einen anderen Browser</p>
              <p>• Kontaktieren Sie den Support für weitere Hilfe</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'vidis-activation',
    title: 'telli im VIDIS Portal aktivieren',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">telli im VIDIS Portal aktivieren</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Um telli an Ihrer Schule zu nutzen, muss es zunächst im VIDIS Portal aktiviert werden. Dies ist ein einmaliger Vorgang.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">1</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">VIDIS Portal aufrufen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Melden Sie sich im VIDIS Portal an: <a href="https://vidis.de" className="text-blue-600 hover:text-blue-800 underline">vidis.de</a>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">2</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Dienste-Verwaltung öffnen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Navigieren Sie zu "Dienste-Verwaltung" oder "Service-Management" in Ihrem VIDIS Dashboard.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">telli suchen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Suchen Sie in der Liste der verfügbaren Dienste nach "telli" oder nutzen Sie die Suchfunktion.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">4</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">telli aktivieren</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Klicken Sie auf "Aktivieren" oder "Freischalten" bei telli. Bestätigen Sie die Aktivierung.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">5</span>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Aktivierung bestätigen</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Sie erhalten eine Bestätigung der Aktivierung. telli ist nun für Ihre Schule verfügbar.
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Nach der Aktivierung</h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Sobald telli im VIDIS Portal aktiviert ist, können Sie:
          </p>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Einen Schulleiter-Account für telli erstellen</li>
            <li>• Die Nutzerverwaltung verwenden</li>
            <li>• Lehrkräfte-Accounts anlegen und verwalten</li>
            <li>• telli in Ihrem Schulbetrieb nutzen</li>
          </ul>
        </div>
        
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Probleme bei der Aktivierung?</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Falls Sie telli nicht im VIDIS Portal finden oder aktivieren können:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Überprüfen Sie Ihre Berechtigung als Schulleitung</li>
            <li>• Kontaktieren Sie den VIDIS Support</li>
            <li>• Prüfen Sie, ob telli für Ihr Bundesland verfügbar ist</li>
            <li>• Wenden Sie sich an den telli Support</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'user-management',
    title: 'Lehrkräfte löschen oder deaktivieren',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Lehrkräfte löschen oder deaktivieren</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Sie können Lehrkraft-Accounts verwalten, indem Sie sie deaktivieren oder dauerhaft löschen.
          </p>
        </div>
        
        <div className="grid gap-4">
          <div className="card p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              Account deaktivieren (empfohlen)
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Deaktivierung ist die sicherere Option - der Account wird gesperrt, aber alle Daten bleiben erhalten.
            </p>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <p><strong>Vorteile:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Account kann später wieder aktiviert werden</li>
                <li>• Alle Daten und Einstellungen bleiben erhalten</li>
                <li>• Reversible Aktion</li>
                <li>• Bei Personalproblemen ideal</li>
              </ul>
            </div>
          </div>
          
          <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Account löschen (permanent)
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
              Löschung entfernt den Account permanent - verwenden Sie diese Option nur bei dauerhaftem Weggang.
            </p>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <p><strong>Wichtige Hinweise:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Aktion ist nicht rückgängig zu machen</li>
                <li>• Alle Daten werden dauerhaft gelöscht</li>
                <li>• Nur bei dauerhaftem Weggang verwenden</li>
                <li>• Erfordert zusätzliche Sicherheitsbestätigung</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Schritt-für-Schritt Anleitung:</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">1</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Nutzer verwalten öffnen</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gehen Sie zum Tab "Nutzer verwalten" in der Navigation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">2</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Lehrkraft auswählen</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Wählen Sie eine oder mehrere Lehrkräfte durch Anklicken der Checkboxen aus.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">3</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Aktion wählen</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Klicken Sie auf "Deaktivieren" (gelber Button) oder "Löschen" (roter Button).
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">4</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Sicherheitsbestätigung</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Bestätigen Sie die Aktion in der Sicherheitsabfrage. Lesen Sie die Warnung sorgfältig.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">5</span>
              </div>
              <div>
                <h5 className="font-medium text-slate-900 dark:text-slate-100">Aktion abschließen</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Die Aktion wird durchgeführt und die Benutzerliste automatisch aktualisiert.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Deaktivierte Accounts reaktivieren</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
            Deaktivierte Accounts können jederzeit wieder aktiviert werden:
          </p>
          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
            <li>• Deaktivierte Accounts sind grau/durchgestrichen dargestellt</li>
            <li>• Wählen Sie den deaktivierten Account aus</li>
            <li>• Klicken Sie auf &quot;Aktivieren&quot; (grüner Button)</li>
            <li>• Der Account ist sofort wieder nutzbar</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'troubleshooting',
    title: 'Häufige Probleme',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Häufige Probleme und Lösungen</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Hier finden Sie Lösungen für die häufigsten Probleme bei der Nutzung der telli Nutzerverwaltung.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Anmeldung funktioniert nicht</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <p><strong>Mögliche Ursachen und Lösungen:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Überprüfen Sie Ihre E-Mail-Adresse und Passwort</li>
                <li>• Haben Sie Ihren Account bestätigt?</li>
                <li>• Versuchen Sie das Passwort zurückzusetzen</li>
                <li>• Prüfen Sie, ob Sie die Rolle &quot;LEIT&quot; haben</li>
                <li>• Leeren Sie den Browser-Cache</li>
              </ul>
            </div>
          </div>
          
          <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">XML-Import schlägt fehl</h4>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
              <p><strong>Mögliche Ursachen und Lösungen:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Überprüfen Sie das XML-Dateiformat</li>
                <li>• Stellen Sie sicher, dass die Datei nicht beschädigt ist</li>
                <li>• Prüfen Sie die Dateigröße (max. 10MB)</li>
                <li>• Verwenden Sie eine aktuelle SchiLD-Exportdatei</li>
                <li>• Kontaktieren Sie den Support bei persistenten Problemen</li>
              </ul>
            </div>
          </div>
          
          <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Benutzer-Synchronisation fehlgeschlagen</h4>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <p><strong>Mögliche Ursachen und Lösungen:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Überprüfen Sie Ihre Internetverbindung</li>
                <li>• Stellen Sie sicher, dass alle Pflichtfelder ausgefüllt sind</li>
                <li>• Prüfen Sie die E-Mail-Adressen auf Gültigkeit</li>
                <li>• Versuchen Sie es mit weniger Benutzern gleichzeitig</li>
                <li>• Kontaktieren Sie den Support bei wiederholten Fehlern</li>
              </ul>
            </div>
          </div>
          
          <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Langsame Ladezeiten</h4>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <p><strong>Mögliche Ursachen und Lösungen:</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Überprüfen Sie Ihre Internetverbindung</li>
                <li>• Schließen Sie andere Browser-Tabs</li>
                <li>• Verwenden Sie einen aktuellen Browser</li>
                <li>• Leeren Sie den Browser-Cache</li>
                <li>• Versuchen Sie es zu einem anderen Zeitpunkt</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="card p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Browser-Kompatibilität</h4>
          <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
            <p><strong>Unterstützte Browser:</strong></p>
            <ul className="ml-4 space-y-1">
              <li>• Chrome</li>
              <li>• Firefox</li>
              <li>• Safari</li>
              <li>• Edge</li>
            </ul>
            <p className="mt-2">Bitte verwenden Sie immer die neueste Version Ihres Browsers.</p>
          </div>
        </div>
        
        <div className="card p-4 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Weitere Hilfe benötigt?</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Wenn Sie Ihr Problem hier nicht finden können:
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>• Schauen Sie in den anderen Hilfe-Artikeln nach</p>
            <p>• Kontaktieren Sie den Support über &quot;So erhalte ich Support&quot;</p>
            <p>• Beschreiben Sie Ihr Problem möglichst detailliert</p>
            <p>• Fügen Sie Screenshots bei, wenn möglich</p>
          </div>
        </div>
      </div>
    )
  }
];

export default function HelpTab() {
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic>('getting-started');

  const currentTopic = helpTopics.find(topic => topic.id === selectedTopic);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-4 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hilfe-Themen
            </h2>
            <nav className="space-y-2">
              {helpTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedTopic === topic.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className={selectedTopic === topic.id ? 'text-blue-600' : 'text-slate-400'}>
                    {topic.icon}
                  </span>
                  <span className="truncate">{topic.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white">
                  {currentTopic?.icon}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentTopic?.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Hilfe und Anleitung zur telli Nutzerverwaltung
                </p>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              {currentTopic?.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}