import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '@/components/FileUpload';

describe('FileUpload', () => {
  const mockOnUsersLoaded = jest.fn();

  beforeEach(() => {
    mockOnUsersLoaded.mockClear();
  });

  it('should render upload interface', () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    expect(screen.getByText('Upload XML File')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
    expect(screen.getByText('Supports XML files exported from SchILD/Logineo systems')).toBeInTheDocument();
  });

  it('should accept XML files only', () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', '.xml');
  });

  it('should call onUsersLoaded when valid XML is uploaded', async () => {
    render(<FileUpload onUsersLoaded={mockOnUsersLoaded} />);
    
    const xmlContent = `
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
    const input = screen.getByRole('button', { name: /choose file/i }).parentElement?.querySelector('input[type="file"]') as HTMLInputElement;
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.change(input);
    
    await waitFor(() => {
      expect(mockOnUsersLoaded).toHaveBeenCalledWith([
        expect.objectContaining({
          firstName: 'Test',
          lastName: 'Student',
          email: 'test@school.edu',
          userType: 'student',
          schildId: 'S001',
          klasse: '10A',
        })
      ]);
    });
  });
});