import { User } from '@/types';

// Security constants for XML parsing
const MAX_XML_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ELEMENT_DEPTH = 50;
const MAX_ENTITY_EXPANSION = 1000;
const ALLOWED_XML_ELEMENTS = new Set([
  'schild_export', 'person', 'schueler', 'lehrer', 'n', 'given', 'family',
  'sourcedid', 'id', 'email', 'userid', 'institutionrole', 'institutionalrole',
  'group', 'membership', 'description', 'long', 'x-schildnrw-grade',
  'vorname', 'nachname', 'klasse', 'schild_id'
]);

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Performs security validation on XML content before parsing
 */
function validateXmlSecurity(xmlContent: string): SecurityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  if (xmlContent.length > MAX_XML_SIZE) {
    errors.push('XML file exceeds maximum allowed size');
  }

  // Check for XML External Entity (XXE) indicators
  const xxePatterns = [
    /<!ENTITY/i,
    /<!DOCTYPE.*\[/i,
    /SYSTEM\s+["']/i,
    /PUBLIC\s+["']/i,
    /&\w+;/g // Basic entity reference check
  ];

  for (const pattern of xxePatterns) {
    if (pattern.test(xmlContent)) {
      if (pattern === /&\w+;/g) {
        // Count entity references
        const matches = xmlContent.match(pattern);
        if (matches && matches.length > MAX_ENTITY_EXPANSION) {
          errors.push('Excessive entity references detected (potential XML bomb)');
          break;
        }
        if (matches && matches.length > 0) {
          warnings.push('Entity references detected - will be stripped for security');
        }
      } else {
        errors.push('XML External Entity (XXE) patterns detected');
        break;
      }
    }
  }

  // Check for XML bomb patterns (deeply nested elements)
  const depthCheck = xmlContent.match(/<[^>]*>/g);
  if (depthCheck && depthCheck.length > MAX_ELEMENT_DEPTH * 100) {
    warnings.push('Complex XML structure detected - performance may be affected');
  }

  // Check for CDATA sections with suspicious content
  const cdataPattern = /<!\[CDATA\[(.*?)\]\]>/gs;
  const cdataMatches = xmlContent.match(cdataPattern);
  if (cdataMatches) {
    for (const cdata of cdataMatches) {
      if (cdata.includes('<!ENTITY') || cdata.includes('SYSTEM') || cdata.includes('PUBLIC')) {
        errors.push('Suspicious content in CDATA section');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes XML content by removing potentially dangerous elements
 */
function sanitizeXmlContent(xmlContent: string): string {
  // Remove DOCTYPE declarations
  let sanitized = xmlContent.replace(/<!DOCTYPE[^>]*>/gi, '');
  
  // Remove XML processing instructions except the XML declaration
  sanitized = sanitized.replace(/<\?(?!xml)[^>]*\?>/gi, '');
  
  // Remove entity references except for standard HTML entities
  const allowedEntities = ['&lt;', '&gt;', '&amp;', '&quot;', '&apos;'];
  sanitized = sanitized.replace(/&[^;]+;/g, (match) => {
    return allowedEntities.includes(match) ? match : '';
  });
  
  // Remove CDATA sections and extract their content safely
  sanitized = sanitized.replace(/<!\[CDATA\[(.*?)\]\]>/gs, (match, content) => {
    // HTML encode the content to prevent any injection
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  });
  
  return sanitized;
}

/**
 * Validates parsed XML elements against allowed element names
 */
function validateElementSecurity(element: Element): boolean {
  if (!ALLOWED_XML_ELEMENTS.has(element.tagName.toLowerCase())) {
    console.warn(`Unexpected XML element found: ${element.tagName}`);
    return false;
  }
  return true;
}

/**
 * Securely extracts text content from XML elements with sanitization
 */
function safeGetTextContent(element: Element | null): string {
  if (!element) return '';
  
  const content = element.textContent || '';
  
  // Sanitize the content
  return content
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 500); // Limit length to prevent DoS
}

/**
 * Validates user data for security issues
 */
function validateUserData(user: Partial<User>): boolean {
  // Email validation with security considerations
  if (user.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(user.email) || user.email.length > 254) {
      return false;
    }
  }
  
  // Name validation
  const nameRegex = /^[a-zA-ZäöüÄÖÜß\s-']{1,100}$/;
  if (user.firstName && !nameRegex.test(user.firstName)) {
    return false;
  }
  if (user.lastName && !nameRegex.test(user.lastName)) {
    return false;
  }
  
  // SchILD ID validation
  if (user.schildId && (user.schildId.length > 50 || !/^[a-zA-Z0-9-_]+$/.test(user.schildId))) {
    return false;
  }
  
  // Class validation
  if (user.klasse && (user.klasse.length > 20 || !/^[a-zA-Z0-9-_\s]+$/.test(user.klasse))) {
    return false;
  }
  
  return true;
}

/**
 * Securely parses XML file with comprehensive security measures
 */
export function parseXMLFileSecure(xmlContent: string): { users: User[], warnings: string[] } {
  const warnings: string[] = [];
  
  // Step 1: Security validation
  const securityValidation = validateXmlSecurity(xmlContent);
  if (!securityValidation.isValid) {
    throw new Error(`Security validation failed: ${securityValidation.errors.join(', ')}`);
  }
  
  warnings.push(...securityValidation.warnings);
  
  // Step 2: Sanitize content
  const sanitizedContent = sanitizeXmlContent(xmlContent);
  
  // Step 3: Parse with DOMParser (now safe after sanitization)
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedContent, 'text/xml');
  
  // Step 4: Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML format after sanitization');
  }
  
  const users: User[] = [];
  let elementDepth = 0;
  const MAX_USERS = 10000; // Prevent DoS with excessive user count
  
  try {
    // Parse SchILD format with <person> elements
    const persons = doc.querySelectorAll('person');
    
    if (persons.length === 0) {
      // Fallback: try alternative format with <schueler> and <lehrer>
      return parseAlternativeFormatSecure(doc, warnings);
    }
    
    if (persons.length > MAX_USERS) {
      throw new Error(`Too many users in XML file (max: ${MAX_USERS})`);
    }
    
    persons.forEach((person, index) => {
      try {
        elementDepth++;
        if (elementDepth > MAX_ELEMENT_DEPTH) {
          throw new Error('XML structure too deep');
        }
        
        // Validate element security
        if (!validateElementSecurity(person)) {
          warnings.push(`Skipped invalid element at index ${index}`);
          return;
        }
        
        // Extract basic info with security validation
        const firstName = safeGetTextContent(person.querySelector('n given')) || 
                         safeGetTextContent(person.querySelector('given'));
        const lastName = safeGetTextContent(person.querySelector('n family')) || 
                        safeGetTextContent(person.querySelector('family'));
        
        // Extract ID with validation
        const schildId = safeGetTextContent(person.querySelector('sourcedid id')) || 
                        safeGetTextContent(person.querySelector('id')) || 
                        `person-${index}`;
        
        // Extract email with validation
        const email = safeGetTextContent(person.querySelector('email')) || 
                     safeGetTextContent(person.querySelector('userid'));
        
        // Determine user type and extract additional info
        let userType: 'student' | 'teacher' = 'student';
        let klasse: string | undefined;
        
        // Check if this is a teacher
        const institutionRole = person.querySelector('institutionrole');
        const institutionalRole = person.querySelector('institutionalrole');
        
        if (institutionRole?.getAttribute('institutionroletype') === 'faculty' ||
            institutionalRole?.getAttribute('role') === 'Teacher' ||
            institutionalRole?.getAttribute('role') === 'Instructor') {
          userType = 'teacher';
        } else {
          // For students, extract class information
          const group = person.querySelector('group');
          const membership = person.querySelector('membership');
          const gradeElement = person.querySelector('x-schildnrw-grade');
          
          klasse = safeGetTextContent(gradeElement) ||
                  safeGetTextContent(group?.querySelector('description long')) ||
                  safeGetTextContent(group?.querySelector('description')) ||
                  safeGetTextContent(membership?.querySelector('sourcedid id'));
        }
        
        // Create user object
        const user: Partial<User> = {
          id: `${userType}-${index}`,
          firstName,
          lastName,
          email,
          userType,
          schildId,
          klasse: userType === 'student' ? klasse : undefined,
        };
        
        // Validate user data
        if (firstName && lastName && validateUserData(user)) {
          users.push(user as User);
        } else {
          warnings.push(`Skipped invalid user data at index ${index}`);
        }
        
      } catch (error) {
        warnings.push(`Error parsing person at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        elementDepth--;
      }
    });
    
  } catch (error) {
    throw new Error(`XML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { users, warnings };
}

/**
 * Fallback parser for simple XML format with security measures
 */
function parseAlternativeFormatSecure(doc: Document, warnings: string[]): { users: User[], warnings: string[] } {
  const users: User[] = [];
  const MAX_USERS = 10000;
  
  // Parse students
  const students = doc.querySelectorAll('schueler');
  const teachers = doc.querySelectorAll('lehrer');
  
  if (students.length + teachers.length > MAX_USERS) {
    throw new Error(`Too many users in XML file (max: ${MAX_USERS})`);
  }
  
  // Process students
  students.forEach((student, index) => {
    try {
      if (!validateElementSecurity(student)) {
        warnings.push(`Skipped invalid student element at index ${index}`);
        return;
      }
      
      const firstName = safeGetTextContent(student.querySelector('vorname'));
      const lastName = safeGetTextContent(student.querySelector('nachname'));
      const email = safeGetTextContent(student.querySelector('email'));
      const klasse = safeGetTextContent(student.querySelector('klasse'));
      const schildId = safeGetTextContent(student.querySelector('schild_id')) || `student-${index}`;
      
      const user: Partial<User> = {
        id: `student-${index}`,
        firstName,
        lastName,
        email,
        userType: 'student',
        schildId,
        klasse,
      };
      
      if (firstName && lastName && validateUserData(user)) {
        users.push(user as User);
      } else {
        warnings.push(`Skipped invalid student data at index ${index}`);
      }
    } catch (error) {
      warnings.push(`Error parsing student at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Process teachers
  teachers.forEach((teacher, index) => {
    try {
      if (!validateElementSecurity(teacher)) {
        warnings.push(`Skipped invalid teacher element at index ${index}`);
        return;
      }
      
      const firstName = safeGetTextContent(teacher.querySelector('vorname'));
      const lastName = safeGetTextContent(teacher.querySelector('nachname'));
      const email = safeGetTextContent(teacher.querySelector('email'));
      const schildId = safeGetTextContent(teacher.querySelector('schild_id')) || `teacher-${index}`;
      
      const user: Partial<User> = {
        id: `teacher-${index}`,
        firstName,
        lastName,
        email,
        userType: 'teacher',
        schildId,
      };
      
      if (firstName && lastName && validateUserData(user)) {
        users.push(user as User);
      } else {
        warnings.push(`Skipped invalid teacher data at index ${index}`);
      }
    } catch (error) {
      warnings.push(`Error parsing teacher at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return { users, warnings };
}

// Export the original function name for backwards compatibility
export const parseXMLFile = parseXMLFileSecure;