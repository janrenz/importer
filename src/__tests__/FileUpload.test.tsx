import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '@/components/FileUpload';

// Mock the secure XML parser
jest.mock('@/lib/secureXmlParser', () => ({
  parseXMLFileSecure: jest.fn()
}));

// Mock security utilities
jest.mock('@/types/security', () => ({
  securityUtils: {
    validateFileType: jest.fn(() => true),
    sanitizeFilename: jest.fn((filename) => filename),
    isSecureContext: jest.fn(() => true)
  },
  SECURITY_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
  }
}));

// Mock console.error to suppress error logs in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

import { parseXMLFileSecure } from '@/lib/secureXmlParser';
const mockParseXMLFileSecure = parseXMLFileSecure as jest.MockedFunction<typeof parseXMLFileSecure>;

describe('FileUpload', () => {
  const mockOnUsersLoaded = jest.fn();

  beforeEach(() => {
    mockOnUsersLoaded.mockClear();
    mockParseXMLFileSecure.mockClear();
    jest.clearAllMocks();
  });

  it('should render upload interface', () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    expect(screen.getByText('Datei auswählen')).toBeInTheDocument();
    expect(screen.getByText('SchILD Export (XML) hochladen')).toBeInTheDocument();
  });

  it('should accept XML files only', () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.xml');
  });

  it('should call onUsersLoaded when valid XML is uploaded', async () => {
    const mockUsers = [{
      id: 'test-1',
      firstName: 'Test',
      lastName: 'Student',
      email: 'test@school.edu',
      userType: 'student' as const,
      schildId: 'S001',
      klasse: '10A',
    }];

    mockParseXMLFileSecure.mockReturnValue({
      users: mockUsers,
      warnings: [],
      errors: []
    });

    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const xmlContent = `
      <?xml version="1.0" encoding="UTF-8"?>
      <schild_export>
        <schueler>
          <vorname>Test</vorname>
          <nachname>Student</nachname>
          <email>test@school.edu</email>
          <klasse>10A</klasse>
          <schild_id>S001</schild_id>
        </schueler>
      </schild_export>
    `;
    
    const file = new File([xmlContent], 'test.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(mockOnUsersLoaded).toHaveBeenCalledWith(mockUsers, []);
    });
  });

  it('should handle file size validation', async () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    // Create a file that's too large (larger than 10MB)
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    const file = new File([largeContent], 'large.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Datei ist zu groß/)).toBeInTheDocument();
    });
  });

  it('should handle XML parsing errors', async () => {
    mockParseXMLFileSecure.mockImplementation(() => {
      throw new Error('Invalid XML format');
    });

    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const xmlContent = '<invalid-xml>';
    const file = new File([xmlContent], 'invalid.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid XML format/)).toBeInTheDocument();
    });
  });

  it('should handle empty files', async () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const file = new File([''], 'empty.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Datei ist leer/)).toBeInTheDocument();
    });
  });

  it('should show processing state during file processing', async () => {
    // Create a delayed promise to simulate processing time
    let resolvePromise: (value: any) => void;
    const processingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockParseXMLFileSecure.mockReturnValue(processingPromise as any);

    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const xmlContent = '<?xml version="1.0"?><schild_export></schild_export>';
    const file = new File([xmlContent], 'test.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    // Should show processing state
    expect(screen.getByText('Datei wird verarbeitet...')).toBeInTheDocument();
    
    // Resolve the promise to finish processing
    resolvePromise!({ users: [], warnings: [], errors: [] });
    
    await waitFor(() => {
      expect(screen.getByText('SchILD Export (XML) hochladen')).toBeInTheDocument();
    });
  });

  it('should handle non-XML file types', async () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const txtContent = 'This is not XML';
    const file = new File([txtContent], 'test.txt', { type: 'text/plain' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Nur XML-Dateien sind erlaubt/)).toBeInTheDocument();
    });
  });

  it('should handle very small files', async () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const smallContent = 'x'; // Very small file (1 byte)
    const file = new File([smallContent], 'small.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(screen.getByText(/Datei ist zu klein oder leer/)).toBeInTheDocument();
    });
  });

  it('should display warnings from parsing', async () => {
    const mockUsers = [{
      id: 'test-1',
      firstName: 'Test',
      lastName: 'Student',
      email: 'test@school.edu',
      userType: 'student' as const,
      schildId: 'S001',
      klasse: '10A',
    }];

    const warnings = ['Test warning message'];

    mockParseXMLFileSecure.mockReturnValue({
      users: mockUsers,
      warnings: warnings,
      errors: []
    });

    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const xmlContent = '<?xml version="1.0"?><schild_export><schueler><vorname>Test</vorname></schueler></schild_export>';
    const file = new File([xmlContent], 'test.xml', { type: 'text/xml' });
    const input = document.getElementById('xml-file-input') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(mockOnUsersLoaded).toHaveBeenCalledWith(mockUsers, warnings);
    });
  });
});