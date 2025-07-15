/**
 * OAuth2 PKCE (Proof Key for Code Exchange) utilities for secure authentication
 * Implements RFC 7636 specifications for browser-based applications
 */

/**
 * Generates a cryptographically secure random code verifier
 * @returns Base64URL encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generates a code challenge from the code verifier using SHA256
 * @param verifier The code verifier string
 * @returns Base64URL encoded SHA256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Encodes data to Base64URL format (RFC 4648 Section 5)
 * @param data Uint8Array to encode
 * @returns Base64URL encoded string
 */
function base64URLEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates OAuth2 authorization URL with PKCE parameters
 * @param config OAuth2 configuration
 * @returns Complete authorization URL
 */
export function generateAuthorizationURL(config: {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state?: string;
}): string {
  const { keycloakUrl, realm, clientId, redirectUri, codeChallenge, state } = config;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile email',
  });

  if (state) {
    params.append('state', state);
  }

  return `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for access token using PKCE
 * @param config Token exchange configuration
 * @returns Token response
 */
export async function exchangeCodeForToken(config: {
  keycloakUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}> {
  const { keycloakUrl, realm, clientId, redirectUri, code, codeVerifier } = config;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Token exchange config:', {
      keycloakUrl,
      realm,
      clientId,
      redirectUri,
      code: code.substring(0, 20) + '...',
      codeVerifier: codeVerifier.substring(0, 20) + '...'
    });
  }
  
  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Token exchange request body:', requestBody.toString());
  }
  
  const response = await fetch(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (process.env.NODE_ENV === 'development') {
      console.error('Token exchange failed:', response.status, errorText);
    }
    throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Parses URL parameters from OAuth2 callback
 * @param url Callback URL with parameters
 * @returns Parsed parameters
 */
export function parseCallbackURL(url: string): {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
} {
  const urlObj = new URL(url);
  const params = urlObj.searchParams;
  
  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
  };
}