interface CSVUser {
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'teacher';
}

interface FieldMapping {
  firstName: string[];
  lastName: string[];
  email: string[];
  userType: string[];
}

// Intelligent field mapping based on common header names
const FIELD_MAPPINGS: FieldMapping = {
  firstName: [
    'firstname', 'first_name', 'first name', 'vorname', 'givenname', 'given_name', 'given name',
    'prename', 'vname', 'fn', 'given', 'christian_name', 'rufname'
  ],
  lastName: [
    'lastname', 'last_name', 'last name', 'nachname', 'surname', 'family_name', 'family name',
    'familyname', 'familienname', 'ln', 'family', 'sn', 'familyname'
  ],
  email: [
    'email', 'e-mail', 'e_mail', 'emailaddress', 'email_address', 'email address',
    'mail', 'emailadresse', 'e-mailadresse', 'kontakt'
  ],
  userType: [
    'usertype', 'user_type', 'user type', 'type', 'typ', 'role', 'rolle', 'function',
    'funktion', 'position', 'status', 'benutzertyp', 'art', 'category', 'kategorie',
    'jobtitle', 'job_title', 'job title', 'title', 'titel'
  ]
};

// Keywords that indicate teacher/student status
const TEACHER_KEYWORDS = [
  'teacher', 'lehrer', 'lehrerin', 'staff', 'faculty', 'educator', 'instructor',
  'professor', 'dozent', 'dozentin', 'lehrkraft', 'pädagoge', 'pädagogin'
];

const STUDENT_KEYWORDS = [
  'student', 'schüler', 'schülerin', 'pupil', 'learner', 'lernender', 'lernende',
  'auszubildender', 'auszubildende', 'azubi', 'teilnehmer', 'teilnehmerin'
];

function normalizeFieldName(fieldName: string): string {
  return fieldName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function findBestMatch(headerName: string, possibleMatches: string[]): boolean {
  const normalized = normalizeFieldName(headerName);
  return possibleMatches.some(match => {
    const normalizedMatch = normalizeFieldName(match);
    // Exact match or one contains the other (but with minimum length check)
    return normalized === normalizedMatch || 
           (normalized.length >= 3 && normalizedMatch.length >= 3 && 
            (normalized.includes(normalizedMatch) || normalizedMatch.includes(normalized)));
  });
}

function detectUserType(value: string): 'student' | 'teacher' | null {
  if (!value) return null;
  
  const normalizedValue = value.toLowerCase().trim();
  
  // Check for teacher keywords
  if (TEACHER_KEYWORDS.some(keyword => normalizedValue.includes(keyword))) {
    return 'teacher';
  }
  
  // Check for student keywords
  if (STUDENT_KEYWORDS.some(keyword => normalizedValue.includes(keyword))) {
    return 'student';
  }
  
  return null;
}

function mapCSVHeaders(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  headers.forEach((header, index) => {
    const cleanHeader = header.trim();
    
    // Check in order of specificity to avoid conflicts
    if (findBestMatch(cleanHeader, FIELD_MAPPINGS.firstName) && !mapping.firstName) {
      mapping.firstName = index;
    } else if (findBestMatch(cleanHeader, FIELD_MAPPINGS.lastName) && !mapping.lastName) {
      mapping.lastName = index;
    } else if (findBestMatch(cleanHeader, FIELD_MAPPINGS.email) && !mapping.email) {
      mapping.email = index;
    } else if (findBestMatch(cleanHeader, FIELD_MAPPINGS.userType) && !mapping.userType) {
      mapping.userType = index;
    }
  });
  
  return mapping;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',' || line[i - 1] === ';')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',' || line[i + 1] === ';')) {
      inQuotes = false;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
      continue;
    } else if (char !== '"' || (char === '"' && inQuotes && line[i + 1] === '"')) {
      current += char;
      if (char === '"' && inQuotes && line[i + 1] === '"') {
        i++; // Skip the next quote
      }
    }
    
    i++;
  }
  
  result.push(current.trim());
  return result;
}

export function parseCSVFile(csvContent: string): { 
  users: CSVUser[], 
  mapping: Record<string, number>, 
  errors: string[], 
  headers: string[],
  sampleData: string[][],
  needsManualMapping: boolean 
} {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  
  if (lines.length < 2) {
    throw new Error('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
  }
  
  // Parse headers
  const headers = parseCSVLine(lines[0]);
  const mapping = mapCSVHeaders(headers);
  
  // Parse first few rows for preview
  const sampleData: string[][] = [];
  for (let i = 1; i < Math.min(lines.length, 4); i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length > 0 && !row.every(cell => !cell.trim())) {
      sampleData.push(row);
    }
  }
  
  // Check if mapping is sufficient
  const needsManualMapping = !mapping.firstName && !mapping.lastName;
  
  // If we need manual mapping, return early with the data needed for the dialog
  if (needsManualMapping) {
    return { users: [], mapping, errors: [], headers, sampleData, needsManualMapping };
  }
  
  // For automatic mapping, add warning if email is missing
  if (mapping.email === undefined) {
    errors.push('Keine E-Mail-Spalte gefunden. E-Mail-Adressen müssen manuell eingegeben werden.');
  }
  
  const users: CSVUser[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue; // Skip empty rows
    }
    
    const firstName = mapping.firstName !== undefined ? (row[mapping.firstName] || '').trim() : '';
    const lastName = mapping.lastName !== undefined ? (row[mapping.lastName] || '').trim() : '';
    const email = mapping.email !== undefined ? (row[mapping.email] || '').trim() : '';
    const userTypeValue = mapping.userType !== undefined ? (row[mapping.userType] || '').trim() : '';
    
    // Skip rows without any name data
    if (!firstName && !lastName) {
      errors.push(`Zeile ${i + 1}: Keine Namen gefunden, übersprungen.`);
      continue;
    }
    
    // Determine user type
    let userType: 'student' | 'teacher' = 'teacher'; // Default to teacher
    if (userTypeValue) {
      const detectedType = detectUserType(userTypeValue);
      if (detectedType) {
        userType = detectedType;
      }
    }
    
    // Create user object
    const user: CSVUser = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      userType
    };
    
    users.push(user);
  }
  
  if (users.length === 0) {
    throw new Error('Keine gültigen Benutzerdaten in der CSV-Datei gefunden.');
  }
  
  return { users, mapping, errors, headers, sampleData, needsManualMapping };
}

export function generateMappingReport(mapping: Record<string, number>, headers: string[]): string {
  const mappedFields = Object.entries(mapping)
    .map(([field, index]) => `• ${field}: "${headers[index]}"`)
    .join('\n');
  
  const unmappedHeaders = headers
    .filter((_, index) => !Object.values(mapping).includes(index))
    .map(header => `• "${header}"`)
    .join('\n');
  
  let report = 'Felderzuordnung:\n' + mappedFields;
  
  if (unmappedHeaders) {
    report += '\n\nNicht zugeordnete Spalten:\n' + unmappedHeaders;
  }
  
  return report;
}

export function processCSVWithMapping(
  csvContent: string, 
  customMapping: Record<string, number>
): { users: CSVUser[], errors: string[] } {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  
  if (lines.length < 2) {
    throw new Error('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
  }
  
  const users: CSVUser[] = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    
    if (row.length === 0 || row.every(cell => !cell.trim())) {
      continue; // Skip empty rows
    }
    
    const firstName = customMapping.firstName !== undefined ? (row[customMapping.firstName] || '').trim() : '';
    const lastName = customMapping.lastName !== undefined ? (row[customMapping.lastName] || '').trim() : '';
    const email = customMapping.email !== undefined ? (row[customMapping.email] || '').trim() : '';
    const userTypeValue = customMapping.userType !== undefined ? (row[customMapping.userType] || '').trim() : '';
    
    // Skip rows without any name data
    if (!firstName && !lastName) {
      errors.push(`Zeile ${i + 1}: Keine Namen gefunden, übersprungen.`);
      continue;
    }
    
    // Determine user type
    let userType: 'student' | 'teacher' = 'teacher'; // Default to teacher
    if (userTypeValue) {
      const detectedType = detectUserType(userTypeValue);
      if (detectedType) {
        userType = detectedType;
      }
    }
    
    // Create user object
    const user: CSVUser = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      userType
    };
    
    users.push(user);
  }
  
  if (users.length === 0) {
    throw new Error('Keine gültigen Benutzerdaten in der CSV-Datei gefunden.');
  }
  
  return { users, errors };
}