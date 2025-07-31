/**
 * Security configuration and constants for the application
 */

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy - restrictive but functional
  'Content-Security-Policy': process.env.NODE_ENV === 'production' 
    ? `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`
    : `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: ws: wss:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`,
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Prevent framing (clickjacking protection)
  'X-Frame-Options': 'DENY',
  
  // XSS protection for older browsers
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Feature policy / Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // HSTS (only in production with HTTPS)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  })
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  FILE_UPLOAD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Maximum 10 uploads per window
  },
  API_CALLS: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Maximum 100 API calls per minute
  },
  LOGIN_ATTEMPTS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 login attempts per window
  }
} as const;

// Security validation patterns
export const SECURITY_PATTERNS = {
  // Email validation (RFC 5322 compliant but security-focused)
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Name validation (international characters allowed)
  NAME: /^[a-zA-ZäöüÄÖÜßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-'\.]{1,100}$/,
  
  // SchILD ID validation
  SCHILD_ID: /^[a-zA-Z0-9\-_]{1,50}$/,
  
  // Class name validation
  CLASS_NAME: /^[a-zA-Z0-9\s\-_]{1,20}$/,
  
  // URL validation (basic)
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  
  // Filename validation (safe characters only)
  FILENAME: /^[a-zA-Z0-9._\-\s]{1,255}$/,
  
  // Detect potential XSS attempts
  XSS_DETECTION: /<script[^>]*>.*?<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<link|<meta/gi,
  
  // Detect potential SQL injection attempts
  SQL_INJECTION: /('|(\\)|;|(\-\-)|(\|\|)|(\/\*))/gi,
  
  // Detect potential XML/XXE attempts
  XXE_DETECTION: /<!ENTITY|<!DOCTYPE.*\[|SYSTEM\s+["']|PUBLIC\s+["']/gi
} as const;

// Sensitive data patterns to redact from logs
export const SENSITIVE_PATTERNS = {
  ACCESS_TOKEN: /access_token/gi,
  REFRESH_TOKEN: /refresh_token/gi,
  CODE_VERIFIER: /code_verifier/gi,
  PASSWORD: /password/gi,
  CLIENT_SECRET: /client_secret/gi,
  AUTHORIZATION: /authorization/gi,
  BEARER: /bearer\s+[^\s]+/gi,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi
} as const;

// File type restrictions
export const ALLOWED_FILE_TYPES = {
  XML: ['text/xml', 'application/xml'],
  EXTENSIONS: ['.xml']
} as const;

// Security event types for logging/monitoring
export enum SecurityEventType {
  FILE_UPLOAD_BLOCKED = 'file_upload_blocked',
  XXE_ATTEMPT_DETECTED = 'xxe_attempt_detected',
  XSS_ATTEMPT_DETECTED = 'xss_attempt_detected',
  SQL_INJECTION_DETECTED = 'sql_injection_detected',
  INVALID_FILE_TYPE = 'invalid_file_type',
  FILE_SIZE_EXCEEDED = 'file_size_exceeded',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  TOKEN_VALIDATION_FAILED = 'token_validation_failed',
  INSECURE_CONTEXT = 'insecure_context',
  CONFIGURATION_ERROR = 'configuration_error'
}

// Security logging interface
export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  message: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  ip?: string;
  userId?: string;
}

// Security utility class
export class SecurityConfig {
  private static instance: SecurityConfig;
  private events: SecurityEvent[] = [];
  
  private constructor() {}
  
  static getInstance(): SecurityConfig {
    if (!SecurityConfig.instance) {
      SecurityConfig.instance = new SecurityConfig();
    }
    return SecurityConfig.instance;
  }
  
  /**
   * Log a security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };
    
    this.events.push(securityEvent);
    
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', securityEvent);
    }
    
    // In production, you would send this to your security monitoring system
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring system (implement based on your infrastructure)
      this.sendToMonitoring(securityEvent);
    }
    
    // Keep only the last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }
  
  /**
   * Get recent security events
   */
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }
  
  /**
   * Check if rate limit is exceeded
   */
  checkRateLimit(key: string, config: { windowMs: number; max: number }): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // In a real application, you would use a more sophisticated rate limiting
    // implementation, possibly with Redis or a database
    const recentEvents = this.events.filter(
      event => event.timestamp.getTime() > windowStart && 
      event.details?.key === key
    );
    
    return recentEvents.length >= config.max;
  }
  
  /**
   * Validate if current context is secure
   */
  isSecureContext(): boolean {
    if (typeof window === 'undefined') return true; // Server-side is considered secure
    
    return window.isSecureContext || 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }
  
  /**
   * Get security headers for the current environment
   */
  getSecurityHeaders(): Record<string, string> {
    return { ...SECURITY_HEADERS };
  }
  
  /**
   * Sanitize data for logging (remove sensitive information)
   */
  sanitizeForLog(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    if (typeof data === 'string') {
      let sanitized = data;
      Object.entries(SENSITIVE_PATTERNS).forEach(([, pattern]) => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      });
      return sanitized;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLog(item));
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if key contains sensitive information
      const sensitiveKey = Object.keys(SENSITIVE_PATTERNS).some(pattern => 
        key.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (sensitiveKey) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = this.sanitizeForLog(value);
      }
    }
    
    return sanitized;
  }
  
  /**
   * Send security event to monitoring system
   */
  private sendToMonitoring(event: SecurityEvent): void {
    // Implement based on your monitoring infrastructure
    // Examples: Sentry, DataDog, CloudWatch, custom endpoint
    
    // For now, just log critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      console.error('Critical Security Event:', this.sanitizeForLog(event));
    }
  }
}

export default SecurityConfig;