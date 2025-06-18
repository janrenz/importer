# Test CSV Files for SchILD Keycloak Sync Tool

This directory contains various CSV test files to demonstrate the intelligent field mapping capabilities of the CSV import feature in the "Erstellen" tab.

## Test Files Overview

### 1. `teachers-simple.csv`
**Purpose**: Basic teacher import with German headers
- **Headers**: Vorname, Nachname, Email, Typ
- **Content**: 5 teachers with various German role designations
- **Features**: Tests basic German field mapping and teacher role detection

### 2. `students-mixed.csv`
**Purpose**: Student import with English headers
- **Headers**: FirstName, LastName, EmailAddress, Role, Class
- **Content**: 5 students with one missing email
- **Features**: Tests English field mapping, student role detection, and missing email handling

### 3. `mixed-users.csv`
**Purpose**: Mixed teachers and students with professional titles
- **Headers**: Name, Surname, Mail, Position, Department
- **Content**: 3 teachers, 2 students, 1 without email
- **Features**: Tests role detection with titles like "Dr.", "Professor", "Dozent"

### 4. `alternative-headers.csv`
**Purpose**: Tests alternative English field names
- **Headers**: GivenName, FamilyName, E-Mail, UserType
- **Content**: 3 teachers, 2 students
- **Features**: Tests recognition of formal English field names

### 5. `semicolon-separated.csv`
**Purpose**: Tests semicolon-delimited format with quoted fields
- **Headers**: Vorname;Nachname;"E-Mail Adresse";Benutzertyp;Abteilung
- **Content**: 3 teachers, 2 students with quoted fields
- **Features**: Tests CSV parsing with semicolons and quoted strings

### 6. `german-headers.csv`
**Purpose**: Tests extended German vocabulary
- **Headers**: Rufname, Familienname, Emailadresse, Funktion, Bemerkung
- **Content**: 3 teachers with titles, 2 students
- **Features**: Tests German synonyms like "Rufname", "Familienname", "Pädagoge"

## Unmappable Test Files (Trigger Manual Mapping)

### 7. `truly-unmappable.csv`
**Purpose**: Tests manual mapping dialog with completely foreign headers
- **Headers**: PersonID, FullName, ContactInfo, JobCategory, Department
- **Content**: 5 teachers and 1 student with concatenated names
- **Features**: No automatic field detection, requires manual mapping

### 8. `cryptic-headers.csv`
**Purpose**: Tests manual mapping with cryptic field names
- **Headers**: ID, PersonalName, DigitalContact, Classification, Unit
- **Content**: Teachers and students with concatenated role names
- **Features**: Names include roles in single field, requires splitting

### 9. `completely-foreign.csv`
**Purpose**: Tests manual mapping with enterprise-style headers
- **Headers**: Code, Identity, Communication, Category, Section
- **Content**: Mixed users with lastname-firstname format
- **Features**: Completely non-standard naming conventions

## Field Mapping Intelligence

The CSV parser automatically detects and maps fields based on these patterns:

### First Name Detection
- `firstname`, `first_name`, `first name`, `vorname`, `givenname`, `given_name`, `given name`
- `name`, `prename`, `vname`, `fn`, `given`, `christian_name`, `rufname`

### Last Name Detection
- `lastname`, `last_name`, `last name`, `nachname`, `surname`, `family_name`, `family name`
- `familyname`, `nachname`, `ln`, `family`, `sn`, `familienname`

### Email Detection
- `email`, `e-mail`, `e_mail`, `emailaddress`, `email_address`, `email address`
- `mail`, `emailadresse`, `e-mailadresse`, `kontakt`, `emailadresse`

### User Type Detection
- **Headers**: `usertype`, `user_type`, `user type`, `type`, `typ`, `role`, `rolle`
- `function`, `funktion`, `position`, `status`, `benutzertyp`, `art`, `category`

### Teacher Keywords
- `teacher`, `lehrer`, `lehrerin`, `staff`, `faculty`, `educator`, `instructor`
- `professor`, `dozent`, `dozentin`, `lehrkraft`, `pädagoge`, `pädagogin`

### Student Keywords
- `student`, `schüler`, `schülerin`, `pupil`, `learner`, `lernender`, `lernende`
- `auszubildender`, `auszubildende`, `azubi`, `teilnehmer`, `teilnehmerin`

## Testing Instructions

### Automatic Mapping Test (Files 1-6)
1. Navigate to the "Erstellen" tab in the application
2. Click "CSV importieren" button
3. Select any of the first 6 test CSV files
4. Observe the intelligent field mapping and import results
5. Check the "Felderzuordnung anzeigen" details to see how fields were mapped
6. Review any warnings for missing or problematic data

### Manual Mapping Test (Files 7-9)
1. Navigate to the "Erstellen" tab in the application
2. Click "CSV importieren" button
3. Select any of the unmappable test CSV files (7-9)
4. **Manual Mapping Dialog** should appear automatically
5. Use the dropdown selectors to map CSV columns to user fields
6. Preview the data mapping in real-time
7. Click "Import durchführen" to complete the import

## Expected Behaviors

- **Automatic Field Detection**: Headers are automatically mapped to the correct fields
- **Flexible Parsing**: Both comma and semicolon delimiters are supported
- **Quote Handling**: Quoted fields with special characters are properly parsed
- **Role Detection**: German and English role keywords are recognized
- **Missing Data Handling**: Missing emails generate warnings but don't block import
- **Default Role Assignment**: Unclear roles default to "teacher" for safety
- **Validation**: Empty rows and rows without names are skipped with warnings

## Troubleshooting

If a CSV file doesn't import correctly:
1. Check that it has at least one name field (first or last name)
2. Ensure the file encoding is UTF-8
3. Verify that comma or semicolon separators are used consistently
4. Check that email addresses contain "@" symbols
5. Review the field mapping report for unexpected mappings