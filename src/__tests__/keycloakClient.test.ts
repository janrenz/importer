import { KeycloakClient } from '@/lib/keycloakClient';
import { User, KeycloakConfig, SyncableAttribute } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('KeycloakClient', () => {
  const mockConfig: KeycloakConfig = {
    url: 'https://keycloak.example.com',
    realm: 'test-realm',
    clientId: 'admin-cli',
    username: 'admin',
    password: 'password',
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
  });

  describe('authenticate', () => {
    it('should authenticate successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token' }),
      } as Response);

      const client = new KeycloakClient(mockConfig);
      const result = await client.authenticate();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://keycloak.example.com/realms/test-realm/protocol/openid-connect/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
    });

    it('should handle authentication failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      } as Response);

      const client = new KeycloakClient(mockConfig);
      const result = await client.authenticate();

      expect(result).toBe(false);
    });
  });

  describe('syncUser', () => {
    it('should perform dry run without authentication', async () => {
      const client = new KeycloakClient(mockConfig);
      
      // Mock console.log to verify dry run output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = await client.syncUser(mockUser, mockAttributes, true);
      
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('DRY RUN - Would create user:', expect.any(Object));
      expect(mockFetch).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should sync user successfully', async () => {
      // Mock authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token' }),
      } as Response);

      // Mock user creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const client = new KeycloakClient(mockConfig);
      await client.authenticate();
      
      const result = await client.syncUser(mockUser, mockAttributes, false);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://keycloak.example.com/admin/realms/test-realm/users',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle sync failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token' }),
      } as Response);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      } as Response);

      const client = new KeycloakClient(mockConfig);
      await client.authenticate();
      
      const result = await client.syncUser(mockUser, mockAttributes, false);

      expect(result).toBe(false);
    });
  });
});