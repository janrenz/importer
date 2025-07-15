import { User, KeycloakConfig, SyncableAttribute } from '@/types';
import { generateCodeVerifier, generateCodeChallenge, generateAuthorizationURL, exchangeCodeForToken } from './oauth2-utils';

export class KeycloakClient {
  private config: KeycloakConfig;
  private accessToken: string | null = null;
  private codeVerifier: string | null = null;
  private static tokenExchangeInProgress = false;

  constructor(config: KeycloakConfig) {
    this.config = config;
    // Restore token from session storage if available
    this.accessToken = sessionStorage.getItem('oauth2_access_token');
  }

  /**
   * Initiates OAuth2 Authorization Code Flow with PKCE
   * Redirects user to Keycloak login page
   */
  async initiateLogin(): Promise<void> {
    try {
      // Generate PKCE parameters
      this.codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(this.codeVerifier);
      
      // Generate state parameter for CSRF protection
      const state = generateCodeVerifier();
      
      // Store PKCE parameters and state in session storage
      sessionStorage.setItem('oauth2_code_verifier', this.codeVerifier);
      sessionStorage.setItem('oauth2_state', state);
      
      // Generate authorization URL
      const authURL = generateAuthorizationURL({
        keycloakUrl: this.config.url,
        realm: this.config.realm,
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        codeChallenge,
        state,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated auth URL:', authURL);
        console.log('Code verifier stored:', this.codeVerifier);
      }
      
      // Redirect to Keycloak login
      window.location.href = authURL;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login initiation error:', error);
      }
      throw error;
    }
  }

  /**
   * Completes OAuth2 flow by exchanging authorization code for access token
   */
  async completeLogin(): Promise<boolean> {
    try {
      // Check if already authenticated to prevent duplicate token exchanges
      if (this.accessToken) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Already authenticated, skipping token exchange');
        }
        return true;
      }
      
      // Prevent duplicate token exchanges from React Strict Mode double execution
      if (KeycloakClient.tokenExchangeInProgress) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Token exchange already in progress, waiting...');
        }
        // Wait for the ongoing token exchange to complete
        while (KeycloakClient.tokenExchangeInProgress) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Check if we now have a token
        this.accessToken = sessionStorage.getItem('oauth2_access_token');
        return this.accessToken !== null;
      }
      
      // Retrieve authorization code from session storage (set by callback page)
      const code = sessionStorage.getItem('oauth2_code');
      this.codeVerifier = sessionStorage.getItem('oauth2_code_verifier');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('CompleteLogin - Code:', code ? 'present' : 'missing');
        console.log('CompleteLogin - CodeVerifier:', this.codeVerifier ? 'present' : 'missing');
      }
      
      if (!code || !this.codeVerifier) {
        throw new Error('Missing authorization code or code verifier');
      }
      
      // Set flag to prevent duplicate token exchanges
      KeycloakClient.tokenExchangeInProgress = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Exchanging code for token...');
      }
      // Exchange code for token
      const tokenResponse = await exchangeCodeForToken({
        keycloakUrl: this.config.url,
        realm: this.config.realm,
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        code,
        codeVerifier: this.codeVerifier,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Token response received');
      }
      this.accessToken = tokenResponse.access_token;
      
      // Store token in session storage for persistence
      sessionStorage.setItem('oauth2_access_token', this.accessToken);
      
      // Clean up session storage
      sessionStorage.removeItem('oauth2_code');
      sessionStorage.removeItem('oauth2_state');
      sessionStorage.removeItem('oauth2_code_verifier');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('OAuth2 authentication successful');
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OAuth2 completion error:', error);
      }
      
      // Clean up session storage on error
      sessionStorage.removeItem('oauth2_code');
      sessionStorage.removeItem('oauth2_state');
      sessionStorage.removeItem('oauth2_code_verifier');
      sessionStorage.removeItem('oauth2_access_token');
      
      return false;
    } finally {
      // Always reset the flag when the token exchange completes
      KeycloakClient.tokenExchangeInProgress = false;
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Checks if OAuth2 callback is pending (code available in session)
   */
  isCallbackPending(): boolean {
    return sessionStorage.getItem('oauth2_code') !== null;
  }

  /**
   * Logs out the user locally and from Keycloak
   */
  async logout(): Promise<void> {
    try {
      // Perform remote logout from Keycloak if we have an access token
      if (this.accessToken) {
        await this.performRemoteLogout();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Remote logout failed:', error);
      }
      // Continue with local logout even if remote logout fails
    } finally {
      // Always perform local cleanup
      this.performLocalLogout();
    }
  }

  /**
   * Performs remote logout from Keycloak
   */
  private async performRemoteLogout(): Promise<void> {
    if (!this.accessToken) {
      return;
    }

    try {
      const logoutUrl = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/logout`;
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          refresh_token: sessionStorage.getItem('oauth2_refresh_token') || '',
        }),
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Remote logout response:', response.status);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Remote logout error:', error);
      }
      throw error;
    }
  }

  /**
   * Performs local logout - clears all tokens and storage
   */
  private performLocalLogout(): void {
    // Clear instance variables
    this.accessToken = null;
    this.codeVerifier = null;
    
    // Clear all OAuth2 related session storage
    sessionStorage.removeItem('oauth2_access_token');
    sessionStorage.removeItem('oauth2_refresh_token');
    sessionStorage.removeItem('oauth2_code');
    sessionStorage.removeItem('oauth2_state');
    sessionStorage.removeItem('oauth2_code_verifier');
    
    // Clear any other application-specific storage
    sessionStorage.removeItem('keycloak_config');
    sessionStorage.removeItem('selected_users');
    sessionStorage.removeItem('selected_attributes');
    
    // Clear local storage as well (in case anything was stored there)
    localStorage.removeItem('oauth2_access_token');
    localStorage.removeItem('oauth2_refresh_token');
    localStorage.removeItem('keycloak_config');
    localStorage.removeItem('selected_users');
    localStorage.removeItem('selected_attributes');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Local logout completed - all storage cleared');
    }
  }

  /**
   * Fetches the current user's profile information
   */
  async getCurrentUserProfile(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch user profile:', response.status, errorText);
        }
        throw new Error(`Failed to fetch user profile (${response.status}): ${response.statusText}`);
      }

      const userInfo = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('Current user profile:', userInfo);
      }
      return userInfo;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching user profile:', error);
      }
      throw error;
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
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to check user existence:', response.status, errorText);
        }
        throw new Error(`Failed to check user existence (${response.status}): ${response.statusText} - ${errorText}`);
      }

      const users = await response.json();
      return users.length > 0;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error checking user existence:', error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.error('CORS error when checking user existence. See authentication error for solutions.');
        }
      }
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

      // Add required NRW-specific attributes
      if (!dryRun) {
        try {
          const currentUserProfile = await this.getCurrentUserProfile();
          
          // Add standard attributes
          userPayload.attributes.rolle = ["LEHR"];
          
          // Extract all relevant information from current user's profile
          if (currentUserProfile.bundesland) {
            userPayload.attributes.bundesland = [currentUserProfile.bundesland];
          }
          if (currentUserProfile.schulnummer) {
            userPayload.attributes.schulnummer = [currentUserProfile.schulnummer];
          }
          if (currentUserProfile.schulleiter) {
            userPayload.attributes.schulleiter = [currentUserProfile.schulleiter];
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Added user attributes:', {
              rolle: userPayload.attributes.rolle,
              bundesland: userPayload.attributes.bundesland,
              schulnummer: userPayload.attributes.schulnummer,
              schulleiter: userPayload.attributes.schulleiter
            });
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Could not fetch current user profile for school attributes:', error);
          }
          // Continue with minimal attributes if profile fetch fails
          userPayload.attributes.rolle = ["LEHR"];
        }
      }

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
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('User creation failed:', response.status, errorText);
        }
        throw new Error(`User creation failed (${response.status}): ${response.statusText} - ${errorText}`);
      }

      return { success: true, existed: false };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Sync error:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching users:', error);
      }
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting user:', error);
      }
      return false;
    }
  }
}