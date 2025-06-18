import { User, KeycloakConfig, SyncableAttribute } from '@/types';

export class KeycloakClient {
  private config: KeycloakConfig;
  private accessToken: string | null = null;

  constructor(config: KeycloakConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: this.config.clientId,
          username: this.config.username,
          password: this.config.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  async checkUserExists(username: string, dryRun: boolean = false): Promise<boolean> {
    if (dryRun) {
      // In dry run mode, simulate random user existence for demonstration
      return Math.random() > 0.7; // ~30% chance user already exists
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check user existence: ${response.statusText}`);
      }

      const users = await response.json();
      return users.length > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  async syncUser(user: User, selectedAttributes: SyncableAttribute[], dryRun: boolean = false): Promise<{success: boolean, existed: boolean, error?: string}> {
    if (!dryRun && !this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // First check if user already exists
      const userExists = await this.checkUserExists(user.email, dryRun);
      
      if (userExists) {
        // User already exists, return success but indicate they existed
        return { success: true, existed: true };
      }

      const userPayload: any = {
        username: user.email,
        enabled: true,
        emailVerified: false,
        attributes: {},
      };

      // Map selected attributes
      selectedAttributes.forEach(attr => {
        const value = user[attr.key];
        if (value !== undefined) {
          switch (attr.key) {
            case 'firstName':
              userPayload.firstName = value;
              break;
            case 'lastName':
              userPayload.lastName = value;
              break;
            case 'email':
              userPayload.email = value;
              break;
            default:
              userPayload.attributes[attr.key] = [value];
          }
        }
      });

      if (dryRun) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        // Simulate some failures for demonstration
        if (Math.random() < 0.1) {
          throw new Error('Simulated validation error: Invalid email format');
        }
        
        console.log('DRY RUN - Would create user:', userPayload);
        return { success: true, existed: false };
      }

      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        throw new Error(`User creation failed: ${response.statusText}`);
      }

      return { success: true, existed: false };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, existed: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAllUsers(dryRun: boolean = false): Promise<User[]> {
    if (dryRun) {
      // In dry run mode, return sample users for demonstration
      return [
        {
          id: 'existing-1',
          firstName: 'Max',
          lastName: 'Mustermann', 
          email: 'max.mustermann@school.de',
          userType: 'teacher',
          schildId: 'OLD-001'
        },
        {
          id: 'existing-2',
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@school.de', 
          userType: 'teacher',
          schildId: 'OLD-002'
        }
      ];
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users?max=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const keycloakUsers = await response.json();
      
      // Convert Keycloak user format to our User interface
      return keycloakUsers.map((kUser: any) => ({
        id: kUser.id,
        firstName: kUser.firstName || '',
        lastName: kUser.lastName || '',
        email: kUser.email || kUser.username || '',
        userType: kUser.attributes?.userType?.[0] || 'teacher', // Default to teacher
        schildId: kUser.attributes?.schildId?.[0] || '',
        klasse: kUser.attributes?.klasse?.[0]
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async deleteUser(userId: string, dryRun: boolean = false): Promise<boolean> {
    if (dryRun) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      console.log('DRY RUN - Would delete user:', userId);
      return true;
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}