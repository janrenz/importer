import { parseXMLFile } from '@/lib/xmlParser';

describe('parseXMLFile', () => {
  const sampleXML = `
    <enterprise xmlns="http://www.metaventis.com/ns/cockpit/sync/1.0">
      <person recstatus="1">
        <sourcedid>
          <source>SCHILDNRW-2.0.32.8</source>
          <id>ID-123456-3524</id>
        </sourcedid>
        <name>
          <fn>Doe John</fn>
          <n>
            <family>Doe</family>
            <given>John</given>
          </n>
        </name>
        <email>john.doe@school.edu</email>
        <group>
          <description>10A</description>
        </group>
      </person>
      <person recstatus="1">
        <sourcedid>
          <source>SCHILDNRW-2.0.32.8</source>
          <id>ID-123456-3525</id>
        </sourcedid>
        <name>
          <fn>Smith Jane</fn>
          <n>
            <family>Smith</family>
            <given>Jane</given>
          </n>
        </name>
        <email>jane.smith@school.edu</email>
        <group>
          <description>10B</description>
        </group>
      </person>
      <person recstatus="1">
        <sourcedid>
          <source>SCHILDNRW-2.0.32.8</source>
          <id>ID-123456-3526</id>
        </sourcedid>
        <name>
          <fn>Teacher Bob</fn>
          <n>
            <family>Teacher</family>
            <given>Bob</given>
          </n>
        </name>
        <email>bob.teacher@school.edu</email>
        <institutionrole institutionroletype="faculty"/>
      </person>
    </enterprise>
  `;

  const fallbackXML = `
    <schild_export>
      <schueler>
        <vorname>John</vorname>
        <nachname>Doe</nachname>
        <email>john.doe@school.edu</email>
        <klasse>10A</klasse>
        <schild_id>S001</schild_id>
      </schueler>
      <lehrer>
        <vorname>Bob</vorname>
        <nachname>Teacher</nachname>
        <email>bob.teacher@school.edu</email>
        <schild_id>T001</schild_id>
      </lehrer>
    </schild_export>
  `;

  it('should parse students correctly from SchILD format', () => {
    const users = parseXMLFile(sampleXML);
    const students = users.filter(u => u.userType === 'student');
    
    expect(students).toHaveLength(2);
    expect(students[0]).toEqual({
      id: 'student-0',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@school.edu',
      userType: 'student',
      schildId: 'ID-123456-3524',
      klasse: '10A',
    });
    expect(students[1]).toEqual({
      id: 'student-1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@school.edu',
      userType: 'student',
      schildId: 'ID-123456-3525',
      klasse: '10B',
    });
  });

  it('should parse teachers correctly from SchILD format', () => {
    const users = parseXMLFile(sampleXML);
    const teachers = users.filter(u => u.userType === 'teacher');
    
    expect(teachers).toHaveLength(1);
    expect(teachers[0]).toEqual({
      id: 'teacher-2',
      firstName: 'Bob',
      lastName: 'Teacher',
      email: 'bob.teacher@school.edu',
      userType: 'teacher',
      schildId: 'ID-123456-3526',
      klasse: undefined,
    });
  });

  it('should handle fallback format', () => {
    const users = parseXMLFile(fallbackXML);
    
    expect(users).toHaveLength(2);
    expect(users[0].userType).toBe('student');
    expect(users[1].userType).toBe('teacher');
  });

  it('should handle empty XML', () => {
    const emptyXML = '<enterprise></enterprise>';
    const users = parseXMLFile(emptyXML);
    
    expect(users).toHaveLength(0);
  });

  it('should handle invalid XML', () => {
    const invalidXML = '<invalid><unclosed>';
    
    expect(() => parseXMLFile(invalidXML)).toThrow('Invalid XML format');
  });

  it('should ignore entries with missing required fields', () => {
    const incompleteXML = `
      <enterprise>
        <person>
          <name>
            <n>
              <given>John</given>
              <!-- Missing family name -->
            </n>
          </name>
          <sourcedid><id>ID-1</id></sourcedid>
        </person>
        <person>
          <name>
            <n>
              <family>Smith</family>
              <given>Jane</given>
            </n>
          </name>
          <sourcedid><id>ID-2</id></sourcedid>
        </person>
      </enterprise>
    `;
    
    const users = parseXMLFile(incompleteXML);
    expect(users).toHaveLength(1);
    expect(users[0].firstName).toBe('Jane');
  });
});