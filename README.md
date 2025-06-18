# SchILD Sync

Eine moderne Web-Anwendung zur Synchronisation von Benutzerdaten aus SchILD/Logineo XML-Exporten mit Keycloak Identity Management Systemen.

## 🎯 Überblick

SchILD Sync ermöglicht es Schulen, ihre Benutzer aus dem SchILD-NRW Schulverwaltungssystem einfach und sicher in Keycloak zu importieren. Die Anwendung läuft vollständig lokal im Browser und gewährleistet maximale Datensicherheit.

## ✨ Features

### 🔐 Sichere lokale Verarbeitung
- Alle Daten werden ausschließlich im Browser verarbeitet
- Keine Übertragung sensibler Daten an externe Server
- Keycloak-Zugangsdaten bleiben lokal gespeichert

### 📊 Flexible Import-Optionen
- **XML-Import**: Direkte Verarbeitung von SchILD/Logineo Exporten
- **CSV-Import**: Manuelle Benutzererstellung mit intelligenter Felderkennung
- **Selektiver Import**: Auswahl einzelner Benutzer und Attribute

### 👥 Benutzertypen
- **Lehrer**: Vollständige Synchronisation mit E-Mail-Adressen
- **Schüler**: Vorbereitet für zukünftige Unterstützung
- **Schulleiter**: Administrator-Accounts mit erweiterten Rechten

### 🛠 Erweiterte Funktionen
- **Testmodus**: Simulation der Synchronisation ohne Änderungen
- **Fortschrittsanzeige**: Echtzeit-Feedback während der Synchronisation
- **Fehlerbehandlung**: Detaillierte Berichte über Import-Probleme
- **Dark Mode**: Automatische Anpassung an Systemeinstellungen

## 🚀 Schnellstart

### 1. Schulleiter einrichten
Erstellen Sie zunächst einen Administrator-Account für die Schulleitung:
- Navigieren Sie zum Tab "Schulleiter einrichten"
- Geben Sie Vor- und Nachname sowie E-Mail-Adresse ein
- Klicken Sie auf "Schulleiter anlegen"

### 2. Keycloak konfigurieren
Konfigurieren Sie die Verbindung zu Ihrem Keycloak-System:
- Öffnen Sie das Einstellungsmenü in der Seitenleiste
- Geben Sie Ihre Keycloak-URL und Anmeldedaten ein
- Die Verbindung wird automatisch getestet

### 3. Benutzer importieren
Wählen Sie eine der verfügbaren Import-Methoden:
- **XML-Upload**: SchILD/Logineo Exportdateien
- **CSV-Import**: Manuelle Datenerstellung
- **Einzelerstellung**: Direkte Eingabe im Erstellen-Tab

## 🏗 Technische Details

### Architektur
- **Frontend**: Next.js 13+ mit React und TypeScript
- **Styling**: Tailwind CSS mit modernem Design System
- **Parsing**: Clientseitige XML/CSV-Verarbeitung
- **API**: Keycloak REST API Integration

### Unterstützte Datenformate

#### XML-Struktur (SchILD/Logineo)
```xml
<schild_export>
  <schueler>
    <vorname>Max</vorname>
    <nachname>Mustermann</nachname>
    <email>max.mustermann@schule.de</email>
    <klasse>5A</klasse>
    <schild_id>12345</schild_id>
  </schueler>
  <lehrer>
    <vorname>Maria</vorname>
    <nachname>Musterfrau</nachname>
    <email>maria.musterfrau@schule.de</email>
    <schild_id>67890</schild_id>
  </lehrer>
</schild_export>
```

#### CSV-Format
Die Anwendung erkennt automatisch gängige Spaltennamen:
- **Vorname**: `vorname`, `firstname`, `first_name`, `given_name`
- **Nachname**: `nachname`, `lastname`, `last_name`, `surname`
- **E-Mail**: `email`, `e-mail`, `mail`, `emailadresse`
- **Typ**: `type`, `typ`, `role`, `rolle`, `benutzertyp`

### Keycloak-Attribute
Benutzer werden mit folgenden benutzerdefinierten Attributen erstellt:
- `schild_id`: Eindeutige SchILD-System-Kennung
- `user_type`: Benutzertyp (`student` oder `teacher`)
- `klasse`: Klassenzuordnung (nur für Schüler)

## 🛡 Sicherheit

### Datenschutz
- Keine externe Datenübertragung
- Lokale Verarbeitung aller sensiblen Daten
- Session-basierte Speicherung von Konfigurationen

### Authentifizierung
- Sichere Verbindung zu Keycloak über HTTPS
- Validierung aller API-Anfragen
- Schutz vor Cross-Site-Scripting (XSS)

## 🔧 Entwicklung

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Installation
```bash
# Repository klonen
git clone <repository-url>
cd logineo

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

### Verfügbare Skripte
```bash
# Entwicklung
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build erstellen
npm start           # Produktionsserver starten

# Code-Qualität
npm run lint        # Linting durchführen
npm run typecheck   # TypeScript-Prüfung

# Tests
npm test           # Tests ausführen
npm run test:watch # Tests im Watch-Modus
```

### Projektstruktur
```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Globale Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Hauptseite
├── components/            # React-Komponenten
│   ├── FileUpload.tsx     # XML/CSV-Upload
│   ├── UserList.tsx       # Benutzerauswahl
│   ├── CreateTab.tsx      # Manuelle Erstellung
│   └── SyncProgress.tsx   # Fortschrittsanzeige
├── lib/                   # Business Logic
│   ├── xmlParser.ts       # XML-Verarbeitung
│   ├── csvParser.ts       # CSV-Verarbeitung
│   └── keycloakClient.ts  # Keycloak-Integration
└── types/                 # TypeScript-Definitionen
    └── index.ts           # Kern-Datentypen
```

## 📝 Mitwirken

### Code-Stil
- TypeScript für alle neuen Dateien
- Tailwind CSS für Styling
- ESLint + Prettier für Code-Formatierung
- Umfassende Fehlerbehandlung

### Testing
- Jest für Unit-Tests
- React Testing Library für Komponenten-Tests
- Mock externe API-Aufrufe

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Hilfe-Sektion in der Anwendung
2. Konsultieren Sie die Keycloak-Dokumentation
3. Erstellen Sie ein Issue im Repository

## 🚀 Roadmap

### Geplante Features
- [ ] Schüler-Account-Unterstützung
- [ ] Rollen-basierte Zuweisungen
- [ ] Bulk-Operationen für große Datensätze
- [ ] Erweiterte Filteroptionen
- [ ] Audit-Logging
- [ ] Multi-Mandanten-Fähigkeit

### Bekannte Einschränkungen
- Schüler-Accounts werden derzeit nicht synchronisiert
- Maximale Dateigröße für Uploads: 10MB
- Nur Keycloak-Versionen 15+ werden unterstützt

---

**SchILD Sync** - Entwickelt für moderne Schulverwaltung mit Fokus auf Sicherheit und Benutzerfreundlichkeit.