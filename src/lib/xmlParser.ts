import { User } from '@/types';
import { parseXMLFileSecure } from './secureXmlParser';

/**
 * @deprecated Use parseXMLFileSecure instead for enhanced security
 * This function is maintained for backwards compatibility
 */
export function parseXMLFile(xmlContent: string): User[] {
  console.warn('Using deprecated parseXMLFile - consider upgrading to parseXMLFileSecure');
  const result = parseXMLFileSecure(xmlContent);
  return result.users;
}

/**
 * Legacy implementation kept for reference - DO NOT USE IN PRODUCTION
 */
function parseXMLFileLegacy(xmlContent: string): User[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  
  const users: User[] = [];
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML format');
  }
  
  // Parse SchILD format with <person> elements
  const persons = doc.querySelectorAll('person');
  
  if (persons.length === 0) {
    // Fallback: try alternative format with <schueler> and <lehrer>
    return parseAlternativeFormat(doc);
  }
  
  persons.forEach((person, index) => {
    try {
      // Extract basic info
      const firstName = person.querySelector('n given')?.textContent?.trim() || 
                       person.querySelector('given')?.textContent?.trim() || '';
      const lastName = person.querySelector('n family')?.textContent?.trim() || 
                      person.querySelector('family')?.textContent?.trim() || '';
      
      // Extract ID
      const schildId = person.querySelector('sourcedid id')?.textContent?.trim() || 
                      person.querySelector('id')?.textContent?.trim() || `person-${index}`;
      
      // Extract email
      const email = person.querySelector('email')?.textContent?.trim() || 
                   person.querySelector('userid')?.textContent?.trim() || '';
      
      // Determine user type and extract additional info
      let userType: 'student' | 'teacher' = 'student';
      let klasse: string | undefined;
      
      // Check if this is a teacher (look for faculty role or teacher designation)
      const institutionRole = person.querySelector('institutionrole');
      const institutionalRole = person.querySelector('institutionalrole');
      
      if (institutionRole?.getAttribute('institutionroletype') === 'faculty' ||
          institutionalRole?.getAttribute('role') === 'Teacher' ||
          institutionalRole?.getAttribute('role') === 'Instructor') {
        userType = 'teacher';
      } else {
        // For students, try to extract class information
        const group = person.querySelector('group');
        const membership = person.querySelector('membership');
        const gradeElement = person.querySelector('x-schildnrw-grade');
        
        klasse = gradeElement?.textContent?.trim() ||
                group?.querySelector('description long')?.textContent?.trim() ||
                group?.querySelector('description')?.textContent?.trim() ||
                membership?.querySelector('sourcedid id')?.textContent?.trim() || '';
      }
      
      if (firstName && lastName) {
        users.push({
          id: `${userType}-${index}`,
          firstName,
          lastName,
          email,
          userType,
          schildId,
          klasse: userType === 'student' ? klasse : undefined,
        });
      }
    } catch (error) {
      console.warn(`Error parsing person at index ${index}:`, error);
    }
  });
  
  return users;
}

// Fallback parser for simple XML format
function parseAlternativeFormat(doc: Document): User[] {
  const users: User[] = [];
  
  // Parse students
  const students = doc.querySelectorAll('schueler');
  students.forEach((student, index) => {
    const firstName = student.querySelector('vorname')?.textContent?.trim() || '';
    const lastName = student.querySelector('nachname')?.textContent?.trim() || '';
    const email = student.querySelector('email')?.textContent?.trim() || '';
    const klasse = student.querySelector('klasse')?.textContent?.trim() || '';
    const schildId = student.querySelector('schild_id')?.textContent?.trim() || `student-${index}`;
    
    if (firstName && lastName) {
      users.push({
        id: `student-${index}`,
        firstName,
        lastName,
        email,
        userType: 'student',
        schildId,
        klasse,
      });
    }
  });
  
  // Parse teachers
  const teachers = doc.querySelectorAll('lehrer');
  teachers.forEach((teacher, index) => {
    const firstName = teacher.querySelector('vorname')?.textContent?.trim() || '';
    const lastName = teacher.querySelector('nachname')?.textContent?.trim() || '';  
    const email = teacher.querySelector('email')?.textContent?.trim() || '';
    const schildId = teacher.querySelector('schild_id')?.textContent?.trim() || `teacher-${index}`;
    
    if (firstName && lastName) {
      users.push({
        id: `teacher-${index}`,
        firstName,
        lastName,
        email,
        userType: 'teacher',
        schildId,
      });
    }
  });
  
  return users;
}