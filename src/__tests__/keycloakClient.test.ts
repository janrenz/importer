import { KeycloakClient } from '@/lib/keycloakClient';
import { User, KeycloakConfig, SyncableAttribute } from '@/types';

// Mock OAuth2 utilities
jest.mock('@/lib/oauth2-utils', () => ({
  generateCodeVerifier: jest.fn(() => 'mock-code-verifier'),
  generateCodeChallenge: jest.fn(() => Promise.resolve('mock-code-challenge')),
  generateAuthorizationURL: jest.fn(() => 'https://mock-auth-url.com'),
  exchangeCodeForToken: jest.fn(() => Promise.resolve({ access_token: 'mock-token', token_type: 'Bearer' }))
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });

// Mock window.location
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true
});

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('KeycloakClient', () => {
  const mockConfig: KeycloakConfig = {
    url: 'https://keycloak.example.com',
    realm: 'test-realm',
    clientId: 'admin-cli',
    redirectUri: 'http://localhost:3000/callback'
  };

  const mockUser: User = {
    id: 'test-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    userType: 'student',
    schildId: 'S001',
    klasse: '10A',
  };

  const mockAttributes: SyncableAttribute[] = [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'schildId', label: 'SchILD ID', required: false },
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    window.location.href = '';
  });

  describe('OAuth2 Authentication Flow', () => {
    it('should initiate OAuth2 login flow', async () => {
      const client = new KeycloakClient(mockConfig);
      
      await client.initiateLogin();

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('oauth2_code_verifier', 'mock-code-verifier');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('oauth2_state', expect.any(String));
      expect(window.location.href).toBe('https://mock-auth-url.com');
    });

    it('should complete login when code is available', async () => {
      // Mock session storage with OAuth2 parameters
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'oauth2_authorization_code') return 'mock-code';
        if (key === 'oauth2_state') return 'mock-state';
        if (key === 'oauth2_code_verifier') return 'mock-code-verifier';
        return null;
      });

      const client = new KeycloakClient(mockConfig);
      const result = await client.completeLogin();

      expect(result).toBe(true);
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('oauth2_access_token', 'mock-token');
    });

    it('should handle missing authorization code', async () => {
      mockSessionStorage.getItem.mockReturnValue(null);
      
      const client = new KeycloakClient(mockConfig);
      const result = await client.completeLogin();
      
      expect(result).toBe(false);
    });

    it('should restore token from session storage', () => {
      mockSessionStorage.getItem.mockReturnValue('existing-token');
      
      const client = new KeycloakClient(mockConfig);
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('oauth2_access_token');
    });
  });

  describe('syncUser', () => {
    it('should perform dry run without making API calls', async () => {
      const client = new KeycloakClient(mockConfig);
      
      // Mock console.log to verify dry run output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = await client.syncUser(mockUser, mockAttributes, true);
      
      expect(result.success).toBe(true);
      expect(result.existed).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('DRY RUN - Would create user:', expect.any(Object));
      expect(mockFetch).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should sync user successfully with authentication', async () => {
      // Mock successful user creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers(),
      } as Response);

      // Mock session storage to return a token
      mockSessionStorage.getItem.mockReturnValue('valid-token');

      const client = new KeycloakClient(mockConfig);
      const result = await client.syncUser(mockUser, mockAttributes, false);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://keycloak.example.com/admin/realms/test-realm/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle sync failure', async () => {
      // Mock failed user creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Error details'
      } as Response);

      // Mock session storage to return a token
      mockSessionStorage.getItem.mockReturnValue('valid-token');

      const client = new KeycloakClient(mockConfig);
      const result = await client.syncUser(mockUser, mockAttributes, false);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing authentication token', async () => {
      // Mock no token in session storage
      mockSessionStorage.getItem.mockReturnValue(null);

      const client = new KeycloakClient(mockConfig);
      const result = await client.syncUser(mockUser, mockAttributes, false);

      expect(result.success).toBe(false);
      expect(result.error).toContain('authentication');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should fetch users successfully', async () => {
      const mockKeycloakUsers = [
        { id: '1', username: 'user1', email: 'user1@example.com', firstName: 'User', lastName: 'One' }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockKeycloakUsers,
      } as Response);

      mockSessionStorage.getItem.mockReturnValue('valid-token');

      const client = new KeycloakClient(mockConfig);
      const users = await client.getAllUsers();

      expect(users).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://keycloak.example.com/admin/realms/test-realm/users',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-token',
          }),
        })
      );
    });

    it('should handle fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      mockSessionStorage.getItem.mockReturnValue('valid-token');

      const client = new KeycloakClient(mockConfig);
      
      await expect(client.getAllUsers()).rejects.toThrow();
    });
  });

  describe('Token Management', () => {
    it('should ensure valid token', async () => {
      mockSessionStorage.getItem.mockReturnValue('valid-token');
      
      // Mock userinfo endpoint to validate token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sub: 'user-id' })
      } as Response);

      const client = new KeycloakClient(mockConfig);
      const result = await client.ensureValidToken();

      expect(result).toBe(true);
    });

    it('should handle invalid token', async () => {
      mockSessionStorage.getItem.mockReturnValue('invalid-token');
      
      // Mock userinfo endpoint to reject token
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      } as Response);

      const client = new KeycloakClient(mockConfig);
      const result = await client.ensureValidToken();

      expect(result).toBe(false);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('oauth2_access_token');
    });
  });

  describe('Logout', () => {
    it('should perform logout and clear session', async () => {
      mockSessionStorage.getItem.mockReturnValue('valid-token');
      
      // Mock logout endpoint
      mockFetch.mockResolvedValueOnce({
        ok: true
      } as Response);

      const client = new KeycloakClient(mockConfig);
      await client.logout();

      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });
});