# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern Next.js application with TypeScript and Tailwind CSS for importing user data from SchILD/Logineo XML exports into Keycloak identity management systems. The tool features a sleek, mobile-first design with local file processing, selective user and attribute synchronization, and comprehensive testing capabilities.

## Architecture

The application uses a modern React/Next.js architecture with the following structure:

### Core Components
- **FileUpload**: Handles XML file selection and parsing with drag-and-drop interface
- **UserList**: Displays users in a responsive card grid with multi-selection
- **AttributeSelector**: Toggle interface for selecting which user attributes to sync
- **KeycloakConfig**: Secure configuration form for Keycloak connection settings
- **SyncProgress**: Real-time progress tracking with animated feedback

### Core Libraries
- **xmlParser**: Processes SchILD XML exports and extracts user data
- **keycloakClient**: Handles authentication and user synchronization with Keycloak API
- **TypeScript types**: Comprehensive type definitions for User, KeycloakConfig, and SyncableAttribute

### Key Features
- **Local Processing**: All XML parsing happens client-side for privacy
- **Dry Run Mode**: Test synchronization without making actual changes
- **Selective Sync**: Choose individual users and attributes to synchronize
- **Real-time Feedback**: Animated progress tracking and error reporting
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Responsive Design**: Mobile-first approach with modern glassmorphism effects

## Key Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles with design system
│   ├── layout.tsx         # Root layout with header
│   └── page.tsx           # Main application page
├── components/            # Reusable React components
│   ├── FileUpload.tsx     # XML file upload interface
│   ├── UserList.tsx       # User selection grid
│   ├── AttributeSelector.tsx # Attribute selection form
│   ├── KeycloakConfig.tsx # Keycloak configuration
│   └── SyncProgress.tsx   # Progress tracking display
├── lib/                   # Business logic and utilities
│   ├── xmlParser.ts       # SchILD XML parsing logic
│   └── keycloakClient.ts  # Keycloak API integration
├── types/                 # TypeScript type definitions
│   └── index.ts           # Core data types
└── __tests__/             # Jest test suites
    ├── xmlParser.test.ts
    ├── FileUpload.test.tsx
    └── keycloakClient.test.ts
```

## Data Flow

1. **File Upload**: User selects SchILD XML export file via FileUpload component
2. **XML Parsing**: xmlParser processes file and extracts user data (students/teachers)
3. **User Selection**: UserList displays users in card grid for individual selection
4. **Attribute Configuration**: AttributeSelector allows choosing which fields to sync
5. **Keycloak Configuration**: User enters connection details for Keycloak instance
6. **Sync Process**: 
   - **Test Run**: Validates data and simulates API calls without changes
   - **Live Sync**: Authenticates with Keycloak and creates users with selected attributes
7. **Progress Tracking**: SyncProgress shows real-time status with animated feedback

## XML Structure Expected

The tool expects SchILD/Logineo XML exports with this structure:
```xml
<schild_export>
  <schueler>
    <vorname>Student First Name</vorname>
    <nachname>Student Last Name</nachname>
    <email>student@school.edu</email>
    <klasse>Class ID</klasse>
    <schild_id>Unique SchILD ID</schild_id>
  </schueler>
  <lehrer>
    <vorname>Teacher First Name</vorname>
    <nachname>Teacher Last Name</nachname>
    <email>teacher@school.edu</email>
    <schild_id>Unique SchILD ID</schild_id>
  </lehrer>
</schild_export>
```

## Custom Keycloak Attributes

Users are created with these custom attributes:
- `schild_id`: Original SchILD system identifier
- `user_type`: Either "student" or "teacher"
- `klasse`: Class assignment (students only)

## Design System

The application uses a modern design system with:

### Colors
- **Primary**: Blue gradient (blue-500 to purple-600)
- **Secondary**: Slate color palette
- **Accent**: Amber for warnings and test mode
- **Success**: Green for successful operations
- **Error**: Red for failures

### Components
- **Cards**: Rounded corners (rounded-2xl) with subtle shadows
- **Buttons**: Three variants (btn-primary, btn-secondary, btn-accent)
- **Animations**: Fade-in, slide-up, and bounce-in effects
- **Glass Effects**: Backdrop blur for modern layering

### Layout
- **Responsive Grid**: Mobile-first with breakpoints
- **Sticky Header**: Backdrop blur with transparency
- **Card Grid**: Responsive user display with hover effects

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns with hooks
- Implement comprehensive error handling
- Use Tailwind CSS utility classes consistently
- Add animations for enhanced user experience

### Security Considerations
- All XML processing happens client-side
- Keycloak credentials stored only in browser session
- Never commit authentication details
- Use HTTPS for all Keycloak communications
- Validate all user input and API responses

### Testing Strategy
- Unit tests for parsing logic and API clients
- Component tests for user interactions
- Mock external API calls in tests
- Test both success and failure scenarios
- Use React Testing Library for component tests

### Performance Best Practices
- Lazy load components when possible
- Optimize re-renders with useCallback and useMemo
- Use CSS animations for smooth transitions
- Implement proper loading states
- Handle large XML files efficiently

## Future Enhancements

Consider implementing:
- Bulk operations for large user sets
- Role assignment based on user types
- Advanced filtering and search
- Configuration file import/export
- Integration with other identity providers
- Audit logging for sync operations
- User avatar and profile management