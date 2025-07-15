/**
 * Fetch utilities with timeout and retry mechanisms
 */

interface FetchWithRetryOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Creates a fetch request with timeout support
 */
function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Fetch with retry mechanism for handling temporary network issues
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    retryCondition = (error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return (
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.message.includes('Failed to fetch') ||
        (error.status >= 500 && error.status < 600)
      );
    }
  } = retryOptions;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      
      // Check if response is ok or should be retried
      if (!response.ok && retryCondition({ status: response.status })) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === retries) {
        break;
      }
      
      // Only retry if the error matches the retry condition
      if (!retryCondition(error)) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Fetch retry attempt ${attempt + 1}/${retries} for ${url}:`, error.message);
      }
    }
  }
  
  throw lastError;
}

/**
 * Specialized fetch for Keycloak API calls with appropriate timeout and retry settings
 */
export async function keycloakFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: FetchWithRetryOptions = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const defaultRetryOptions: FetchWithRetryOptions = {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000,
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      // Don't retry on 4xx client errors (except 408 Request Timeout and 429 Too Many Requests)
      return (
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.message.includes('Failed to fetch') ||
        error.status === 408 ||
        error.status === 429 ||
        (error.status >= 500 && error.status < 600)
      );
    },
    ...retryOptions,
  };

  return fetchWithRetry(url, defaultOptions, defaultRetryOptions);
}

