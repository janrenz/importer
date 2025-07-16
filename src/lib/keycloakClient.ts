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
      
      // Store tokens in session storage for persistence
      sessionStorage.setItem('oauth2_access_token', this.accessToken);
      if (tokenResponse.refresh_token) {
        sessionStorage.setItem('oauth2_refresh_token', tokenResponse.refresh_token);
      }
      
      // Store token expiration time
      if (tokenResponse.expires_in) {
        const expiryTime = Date.now() + (tokenResponse.expires_in * 1000) - 30000; // Subtract 30 seconds for buffer
        sessionStorage.setItem('oauth2_token_expiry', expiryTime.toString());
      }
      
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
      sessionStorage.removeItem('oauth2_token_expiry');
      
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
    if (!this.accessToken) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Token expired during authentication check');
      }
      // Don't clear the token here, let the caller handle it
      return false;
    }
    
    return true;
  }

  /**
   * Checks if the current token is expired or about to expire
   */
  private isTokenExpired(): boolean {
    const expiryTime = sessionStorage.getItem('oauth2_token_expiry');
    if (!expiryTime) {
      return false; // If no expiry time stored, assume token is valid
    }
    
    const expired = Date.now() >= parseInt(expiryTime);
    
    if (process.env.NODE_ENV === 'development' && expired) {
      console.log('Token expired:', new Date(parseInt(expiryTime)).toISOString());
    }
    
    return expired;
  }

  /**
   * Checks if token needs refresh and refreshes it if necessary
   */
  async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    if (this.isTokenExpired()) {
      return await this.refreshAccessToken();
    }

    return true;
  }

  /**
   * Refreshes the access token using the refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = sessionStorage.getItem('oauth2_refresh_token');
    if (!refreshToken) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No refresh token available');
      }
      return false;
    }

    try {
      const response = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.clientId,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Token refresh failed:', response.status);
        }
        // Clear tokens on refresh failure
        this.performLocalLogout();
        return false;
      }

      const tokenResponse = await response.json();
      this.accessToken = tokenResponse.access_token;
      
      // Update stored tokens
      sessionStorage.setItem('oauth2_access_token', this.accessToken);
      if (tokenResponse.refresh_token) {
        sessionStorage.setItem('oauth2_refresh_token', tokenResponse.refresh_token);
      }
      
      // Update token expiration time
      if (tokenResponse.expires_in) {
        const expiryTime = Date.now() + (tokenResponse.expires_in * 1000) - 30000; // Subtract 30 seconds for buffer
        sessionStorage.setItem('oauth2_token_expiry', expiryTime.toString());
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Token refreshed successfully');
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token refresh error:', error);
      }
      this.performLocalLogout();
      return false;
    }
  }

  /**
   * Makes an authenticated request with automatic token refresh
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired or about to expire and refresh if needed
    if (this.isTokenExpired()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Token expired, refreshing before request...');
      }
      
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Authentication expired and refresh failed');
      }
    }

    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const attemptFetch = async (isRetry: boolean = false): Promise<Response> => {
      try {
        const response = await fetch(url, requestOptions);
        
        // If token expired, try to refresh and retry
        if (response.status === 401) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Token expired, attempting refresh...');
          }
          
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            const newRequestOptions = {
              ...requestOptions,
              headers: {
                ...requestOptions.headers,
                'Authorization': `Bearer ${this.accessToken}`,
              },
            };
            return fetch(url, newRequestOptions);
          } else {
            throw new Error('Authentication expired and refresh failed');
          }
        }

        return response;
      } catch (error) {
        // If this is a network error and we haven't already retried, try to refresh token and retry
        if (!isRetry && error instanceof TypeError && error.message.includes('Failed to fetch')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Network error detected, attempting token refresh and retry...');
          }
          
          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              // Update the request options with new token
              const newRequestOptions = {
                ...requestOptions,
                headers: {
                  ...requestOptions.headers,
                  'Authorization': `Bearer ${this.accessToken}`,
                },
              };
              
              // Retry the request with fresh token
              return attemptFetch(true);
            }
          } catch (refreshError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Token refresh failed during retry:', refreshError);
            }
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.error('Authenticated fetch error:', error);
        }
        throw error;
      }
    };

    return attemptFetch();
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
      const refreshToken = sessionStorage.getItem('oauth2_refresh_token');
      
      // Prepare logout request body
      const body = new URLSearchParams({
        client_id: this.config.clientId,
      });
      
      // Add refresh token if available
      if (refreshToken) {
        body.append('refresh_token', refreshToken);
      }
      
      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Remote logout response:', response.status, await response.text());
      }
      
      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Remote logout error:', error);
      }
      throw error;
    }
  }

  /**
   * Gets a user by email address
   */
  async getUserByEmail(email: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.config.url}/admin/realms/${this.config.realm}/users?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user (${response.status}): ${response.statusText}`);
    }

    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Sends verification email to a user
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.config.url}/admin/realms/${this.config.realm}/users/${userId}/send-verify-email`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Optional: customize email parameters
          // client_id: this.config.clientId,
          // redirect_uri: 'your-redirect-uri'
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send verification email (${response.status}): ${errorText}`);
    }
  }

  /**
   * Sends password reset email to a user
   */
  async sendPasswordResetEmail(userId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${this.config.url}/admin/realms/${this.config.realm}/users/${userId}/execute-actions-email`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          "UPDATE_PASSWORD"
        ]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send password reset email (${response.status}): ${errorText}`);
    }
  }

  /**
   * Performs local logout - clears all tokens and storage
   */
  performLocalLogout(): void {
    // Clear instance variables
    this.accessToken = null;
    this.codeVerifier = null;
    
    // Clear all OAuth2 related session storage
    sessionStorage.removeItem('oauth2_access_token');
    sessionStorage.removeItem('oauth2_refresh_token');
    sessionStorage.removeItem('oauth2_token_expiry');
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
   * Fetches the current user's profile information including custom attributes
   */
  async getCurrentUserProfile(): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // First get basic user info to get the user ID
      const userinfoResponse = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/userinfo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userinfoResponse.ok) {
        const errorText = await userinfoResponse.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch user info:', userinfoResponse.status, errorText);
        }
        throw new Error(`Failed to fetch user info (${userinfoResponse.status}): ${userinfoResponse.statusText}`);
      }

      const userInfo = await userinfoResponse.json();
      
      // Now fetch full user profile including custom attributes from Admin API
      const adminResponse = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userInfo.sub}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!adminResponse.ok) {
        const errorText = await adminResponse.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch full user profile:', adminResponse.status, errorText);
        }
        // Fall back to basic user info if admin API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Current user profile (basic):', userInfo);
        }
        return userInfo;
      }

      const fullProfile = await adminResponse.json();
      
      // Extract custom attributes from the attributes object
      const customAttributes: { [key: string]: string } = {};
      if (fullProfile.attributes) {
        Object.keys(fullProfile.attributes).forEach(key => {
          // Keycloak stores attributes as arrays, take the first value
          customAttributes[key] = fullProfile.attributes[key][0];
        });
      }

      const enrichedProfile = {
        ...userInfo,
        ...customAttributes,
        fullProfile
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Current user profile (enriched):', enrichedProfile);
      }
      
      return enrichedProfile;
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
        // User already exists, optionally send password reset email
        if (!dryRun) {
          try {
            // Get user ID for sending password reset
            const existingUser = await this.getUserByEmail(user.email);
            if (existingUser && existingUser.id) {
              // You can uncomment this if you want to automatically send password reset
              // await this.sendPasswordResetEmail(existingUser.id);
              if (process.env.NODE_ENV === 'development') {
                console.log('User already exists:', user.email);
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Could not send password reset to existing user:', error);
            }
          }
        }
        return { success: true, existed: true };
      }

      const userPayload: any = {
        username: user.email,
        enabled: true,
        emailVerified: false,
        attributes: {},
        // Add required actions for new users
        requiredActions: [
          "VERIFY_EMAIL",
          "UPDATE_PASSWORD"
        ]
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
      // Always add these attributes, even in dry run mode for proper testing
      try {
        const currentUserProfile = await this.getCurrentUserProfile();
        
        // Add standard attributes
        userPayload.attributes.rolle = ["LEHR"];
        
        // Extract all relevant information from current user's profile
        // Handle both flattened format and nested format
        const getBundesland = () => {
          return currentUserProfile.bundesland || 
                 currentUserProfile.attributes?.bundesland?.[0] || 
                 currentUserProfile.attributes?.bundesland;
        };
        
        const getSchulnummer = () => {
          return currentUserProfile.schulnummer || 
                 currentUserProfile.attributes?.schulnummer?.[0] || 
                 currentUserProfile.attributes?.schulnummer;
        };
        
        const getSchulleiter = () => {
          return currentUserProfile.schulleiter || 
                 currentUserProfile.attributes?.schulleiter?.[0] || 
                 currentUserProfile.attributes?.schulleiter;
        };
        
        const bundesland = getBundesland();
        const schulnummer = getSchulnummer();
        const schulleiter = getSchulleiter();
        
        if (bundesland) {
          userPayload.attributes.bundesland = [bundesland];
        }
        if (schulnummer) {
          userPayload.attributes.schulnummer = [schulnummer];
        }
        if (schulleiter) {
          userPayload.attributes.schulleiter = [schulleiter];
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

      // Get the created user's ID from the Location header
      const locationHeader = response.headers.get('Location');
      let userId: string | null = null;
      
      if (locationHeader) {
        const urlParts = locationHeader.split('/');
        userId = urlParts[urlParts.length - 1];
      }
      
      // If we have the user ID, send verification email
      if (userId) {
        try {
          await this.sendVerificationEmail(userId);
          if (process.env.NODE_ENV === 'development') {
            console.log('Verification email sent to:', user.email);
          }
        } catch (emailError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to send verification email:', emailError);
          }
          // Don't fail the entire operation if email sending fails
        }
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
      // Get current user's school ID for filtering
      let currentUserSchoolId: string | null = null;
      let currentUserId: string | null = null;
      
      try {
        const currentUserProfile = await this.getCurrentUserProfile();
        currentUserSchoolId = currentUserProfile.schulnummer || 
                             currentUserProfile.attributes?.schulnummer?.[0] || 
                             currentUserProfile.attributes?.schulnummer;
        currentUserId = currentUserProfile.sub || currentUserProfile.id;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not fetch current user profile for school filtering:', error);
        }
      }
      
      // Build query parameters for API-level filtering
      const queryParams = new URLSearchParams({
        max: '1000'
      });
      
      // Add school-based filtering if available
      if (currentUserSchoolId) {
        queryParams.append('q', `schulnummer:${currentUserSchoolId}`);
      }
      
      const response = await this.authenticatedFetch(`${this.config.url}/admin/realms/${this.config.realm}/users?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const keycloakUsers = await response.json();
      
      // Only need to filter out current user (school filtering is done at API level)
      let filteredUsers = keycloakUsers;
      
      // Filter out current user
      if (currentUserId) {
        filteredUsers = filteredUsers.filter((kUser: any) => kUser.id !== currentUserId);
      }
      
      // Convert Keycloak user format to our User interface
      return filteredUsers.map((kUser: any) => ({
        id: kUser.id,
        firstName: kUser.firstName || '',
        lastName: kUser.lastName || '',
        email: kUser.email || kUser.username || '',
        userType: kUser.attributes?.userType?.[0] || 'teacher', // Default to teacher
        schildId: kUser.attributes?.schildId?.[0] || '',
        klasse: kUser.attributes?.klasse?.[0],
        enabled: kUser.enabled !== undefined ? kUser.enabled : true
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

  async deactivateUser(userId: string, dryRun: boolean = false): Promise<boolean> {
    if (dryRun) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      console.log('DRY RUN - Would deactivate user:', userId);
      return true;
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deactivate user: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deactivating user:', error);
      }
      return false;
    }
  }

  async activateUser(userId: string, dryRun: boolean = false): Promise<boolean> {
    if (dryRun) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      console.log('DRY RUN - Would activate user:', userId);
      return true;
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to activate user: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error activating user:', error);
      }
      return false;
    }
  }

  async resetUserPassword(userId: string, dryRun: boolean = false): Promise<boolean> {
    if (dryRun) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      console.log('DRY RUN - Would send password reset email to user:', userId);
      return true;
    }

    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      // First, get user details to check if email exists
      const userResponse = await this.authenticatedFetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}`);
      
      if (!userResponse.ok) {
        throw new Error(`Failed to get user details: ${userResponse.statusText}`);
      }
      
      const user = await userResponse.json();
      
      if (!user.email) {
        throw new Error('User has no email address configured');
      }

      // Use query parameters for the execute-actions-email endpoint
      const url = new URL(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}/execute-actions-email`);
      
      // Add query parameters - these are often required for email functionality
      url.searchParams.append('client_id', this.config.clientId);
      url.searchParams.append('redirect_uri', this.config.redirectUri);
      
      // Some Keycloak configurations require lifespan parameter
      url.searchParams.append('lifespan', '43200'); // 12 hours in seconds
      
      const response = await this.authenticatedFetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['UPDATE_PASSWORD']),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.error('Password reset failed:', response.status, errorText);
        }
        
        // Try without query parameters as fallback
        if (response.status === 500) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Retrying password reset without query parameters...');
          }
          
          const fallbackResponse = await this.authenticatedFetch(
            `${this.config.url}/admin/realms/${this.config.realm}/users/${userId}/execute-actions-email`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(['UPDATE_PASSWORD']),
            }
          );
          
          if (!fallbackResponse.ok) {
            const fallbackErrorText = await fallbackResponse.text();
            if (process.env.NODE_ENV === 'development') {
              console.error('Fallback password reset also failed:', fallbackResponse.status, fallbackErrorText);
            }
            throw new Error(`Failed to send password reset email (${fallbackResponse.status}): ${fallbackResponse.statusText}`);
          }
          
          return true;
        }
        
        throw new Error(`Failed to send password reset email (${response.status}): ${response.statusText}`);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending password reset email:', error);
      }
      return false;
    }
  }
}