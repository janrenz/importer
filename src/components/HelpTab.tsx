'use client';

export default function HelpTab() {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Hilfe & Dokumentation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Anleitung zur Verwendung des SchILD-Keycloak Sync Tools
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
SchILD Import-Tab
          </h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">1. SchILD XML-Datei hochladen</h4>
              <p>Laden Sie eine SchILD/Logineo XML-Export-Datei hoch. Das Tool unterstützt das Standard-Export-Format aus SchILD-NRW.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">2. Benutzer auswählen</h4>
              <p>Wählen Sie die Lehrkräfte aus, die Sie zu Keycloak synchronisieren möchten. Schüler werden derzeit nicht unterstützt.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">3. Attribute konfigurieren</h4>
              <p>Bestimmen Sie, welche Benutzerattribute synchronisiert werden sollen (Name, E-Mail, etc.).</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">4. Synchronisation starten</h4>
              <p>Führen Sie zuerst einen Testlauf durch, bevor Sie die tatsächliche Synchronisation starten.</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Erstellen-Tab
          </h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">1. Benutzer eingeben</h4>
              <p>Geben Sie Benutzerdaten direkt in die Tabelle ein: Vorname, Nachname, E-Mail und Benutzertyp.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">2. Zeilen hinzufügen</h4>
              <p>Klicken Sie auf "Zeile hinzufügen", um weitere Benutzer zur Tabelle hinzuzufügen.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">3. Daten validieren</h4>
              <p>Grüne Punkte zeigen gültige Einträge an. Alle Felder müssen ausgefüllt sein und eine gültige E-Mail enthalten.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">4. Benutzer erstellen</h4>
              <p>Führen Sie einen Testlauf durch, bevor Sie die Benutzer tatsächlich in Keycloak erstellen.</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Löschen-Tab
          </h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Option 1: Veraltete Benutzer finden</h4>
              <p>Laden Sie eine SchILD XML-Datei und klicken Sie auf "Veraltete Benutzer finden". Zeigt Benutzer an, die in Keycloak existieren, aber nicht in der XML-Datei.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Option 2: Alle Benutzer laden</h4>
              <p>Klicken Sie auf "Alle Benutzer laden", um alle Benutzer aus Keycloak anzuzeigen (der aktuelle Administrator wird automatisch ausgeschlossen).</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">3. Benutzer auswählen</h4>
              <p>Wählen Sie die Benutzer aus, die Sie löschen möchten. Seien Sie vorsichtig bei dieser Auswahl.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">4. Löschung durchführen</h4>
              <p>Führen Sie zuerst einen Testlauf durch, bevor Sie die Benutzer tatsächlich löschen.</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Keycloak-Konfiguration
          </h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Server URL</h4>
              <p>Die vollständige URL Ihres Keycloak-Servers (z.B. https://keycloak.example.com)</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Realm</h4>
              <p>Der Name des Keycloak-Realms, in dem die Benutzer verwaltet werden</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Client ID</h4>
              <p>Üblicherweise "admin-cli" für administrative Operationen</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Anmeldedaten</h4>
              <p>Benutzername und Passwort eines Keycloak-Administrators mit Berechtigung zur Benutzerverwaltung</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Wichtige Hinweise
          </h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Datenschutz</h4>
              <p>Alle XML-Verarbeitung erfolgt lokal in Ihrem Browser. Keine Daten werden an externe Server gesendet.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Testlauf</h4>
              <p>Führen Sie immer zuerst einen Testlauf durch, um die Ergebnisse zu überprüfen, bevor Sie tatsächliche Änderungen vornehmen.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">Schüleraccounts</h4>
              <p>Schüleraccounts werden derzeit nicht unterstützt und können nicht synchronisiert werden.</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100">E-Mail-Verifizierung</h4>
              <p>Neu erstellte Benutzer haben den Status "E-Mail nicht verifiziert" und müssen ihre E-Mail-Adresse bestätigen.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Unterstützte XML-Struktur
        </h3>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p className="mb-3">Das Tool erwartet XML-Dateien im SchILD/Logineo-Exportformat mit folgender Struktur:</p>
          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-xs">
{`<enterprise xmlns="http://www.metaventis.com/ns/cockpit/sync/1.0">
  <properties>
    <datasource>SCHILDNRW-2.0.32.8</datasource>
    <target>LOGINEO-3.0.1.14</target>
    <type>SYNC-1.0</type>
    <datetime>2025-05-22T14:05:55</datetime>
  </properties>
  <person recstatus="1">
    <sourcedid>
      <source>SCHILDNRW-2.0.32.8</source>
      <id>ID-123456-3524</id>
    </sourcedid>
    <name>
      <fn>Bauschen Mike</fn>
      <n>
        <family>Bauschen</family>
        <given>Mike</given>
      </n>
    </name>
    <demographics>
      <bday>2004-04-28</bday>
    </demographics>
    <email>M.Bauschen@smail.de</email>
    <systemrole systemroletype="User"/>
    <institutionrole institutionroletype="Student"/>
    <extension>
      <x-schildnrw-person-state>2</x-schildnrw-person-state>
      <x-schildnrw-grade>EF</x-schildnrw-grade>
    </extension>
  </person>
</enterprise>`}
          </pre>
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">Wichtige XML-Elemente:</h4>
            <ul className="space-y-1 text-xs">
              <li><code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">n/given</code> und <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">n/family</code>: Vor- und Nachname</li>
              <li><code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">email</code>: E-Mail-Adresse (erforderlich für Synchronisation)</li>
              <li><code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">institutionrole/@institutionroletype</code>: "Student" oder "Teacher"</li>
              <li><code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">x-schildnrw-grade</code>: Klassenbezeichnung (z.B. EF, 5, 6, 10)</li>
              <li><code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">sourcedid/id</code>: Eindeutige SchILD-ID</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}