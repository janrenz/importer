/**
 * Security-focused TypeScript types and validation utilities
 */

// Security configuration constants
export const SECURITY_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_USERNAME_LENGTH: 254, // RFC 5321 limit
  MAX_NAME_LENGTH: 100,
  MAX_SCHILD_ID_LENGTH: 50,
  MAX_CLASS_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 8,
  MAX_URL_LENGTH: 2048,
  MAX_REALM_LENGTH: 100,
  MAX_CLIENT_ID_LENGTH: 255,
} as const;

// Security validation result interface
export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedValue?: string;
}

// Enhanced User interface with security constraints
export interface SecureUser {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly userType: 'student' | 'teacher';
  readonly schildId: string;
  readonly klasse?: string;
  readonly enabled?: boolean;
  readonly createdAt?: Date;
  readonly lastModified?: Date;
}

// Secure Keycloak configuration with validation
export interface SecureKeycloakConfig {
  readonly url: string;
  readonly realm: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly isSecure?: boolean; // Indicates HTTPS usage
  readonly csrfToken?: string; // CSRF protection token
}

// Input sanitization and validation functions
export class SecurityValidator {
  
  /**
   * Validates and sanitizes email addresses
   */
  static validateEmail(email: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email is required and must be a string');
      return { isValid: false, errors, warnings };
    }
    
    // Length check
    if (email.length > SECURITY_LIMITS.MAX_USERNAME_LENGTH) {
      errors.push(`Email exceeds maximum length of ${SECURITY_LIMITS.MAX_USERNAME_LENGTH} characters`);
    }
    
    // Sanitize email
    const sanitized = email.trim().toLowerCase();
    
    // RFC 5322 compliant email regex (simplified for security)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(sanitized)) {
      errors.push('Invalid email format');
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /<script/i,
      /on\w+=/i,
      /data:/i,
      /vbscript:/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        errors.push('Email contains suspicious content');
        break;
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitized
    };
  }
  
  /**
   * Validates and sanitizes names (first name, last name)
   */
  static validateName(name: string, fieldName: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!name || typeof name !== 'string') {
      errors.push(`${fieldName} is required and must be a string`);
      return { isValid: false, errors, warnings };
    }
    
    // Length check
    if (name.length > SECURITY_LIMITS.MAX_NAME_LENGTH) {
      errors.push(`${fieldName} exceeds maximum length of ${SECURITY_LIMITS.MAX_NAME_LENGTH} characters`);
    }
    
    // Sanitize name - allow international characters but remove potentially dangerous ones
    const sanitized = name
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[<>'"&]/g, ''); // Remove HTML/XML special characters
    
    // Validate allowed characters (letters, spaces, hyphens, apostrophes, international characters)
    const nameRegex = /^[a-zA-ZäöüÄÖÜßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-'\.]+$/;
    
    if (!nameRegex.test(sanitized)) {
      errors.push(`${fieldName} contains invalid characters`);
    }
    
    if (sanitized.length === 0) {
      errors.push(`${fieldName} cannot be empty after sanitization`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitized
    };
  }
  
  /**
   * Validates and sanitizes SchILD IDs
   */
  static validateSchildId(schildId: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!schildId || typeof schildId !== 'string') {
      errors.push('SchILD ID is required and must be a string');
      return { isValid: false, errors, warnings };
    }
    
    // Length check
    if (schildId.length > SECURITY_LIMITS.MAX_SCHILD_ID_LENGTH) {
      errors.push(`SchILD ID exceeds maximum length of ${SECURITY_LIMITS.MAX_SCHILD_ID_LENGTH} characters`);
    }
    
    // Sanitize ID
    const sanitized = schildId.trim().replace(/[^\w\-]/g, '');
    
    // Validate format (alphanumeric, hyphens, underscores only)
    const idRegex = /^[a-zA-Z0-9\-_]+$/;
    
    if (!idRegex.test(sanitized)) {
      errors.push('SchILD ID contains invalid characters');
    }
    
    if (sanitized.length === 0) {
      errors.push('SchILD ID cannot be empty after sanitization');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitized
    };
  }
  
  /**
   * Validates and sanitizes class names
   */
  static validateClass(klasse: string | undefined): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!klasse) {
      return { isValid: true, errors, warnings, sanitizedValue: undefined };
    }
    
    if (typeof klasse !== 'string') {
      errors.push('Class must be a string');
      return { isValid: false, errors, warnings };
    }
    
    // Length check
    if (klasse.length > SECURITY_LIMITS.MAX_CLASS_LENGTH) {
      errors.push(`Class name exceeds maximum length of ${SECURITY_LIMITS.MAX_CLASS_LENGTH} characters`);
    }
    
    // Sanitize class name
    const sanitized = klasse
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[<>'"&]/g, ''); // Remove HTML/XML special characters
    
    // Validate format (alphanumeric, spaces, hyphens, underscores)
    const classRegex = /^[a-zA-Z0-9\s\-_]+$/;
    
    if (!classRegex.test(sanitized)) {
      errors.push('Class name contains invalid characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitized || undefined
    };
  }
  
  /**
   * Validates and sanitizes URLs
   */
  static validateUrl(url: string, fieldName: string): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!url || typeof url !== 'string') {
      errors.push(`${fieldName} is required and must be a string`);
      return { isValid: false, errors, warnings };
    }
    
    // Length check
    if (url.length > SECURITY_LIMITS.MAX_URL_LENGTH) {
      errors.push(`${fieldName} exceeds maximum length of ${SECURITY_LIMITS.MAX_URL_LENGTH} characters`);
    }
    
    // Sanitize URL
    const sanitized = url.trim();
    
    try {
      const urlObj = new URL(sanitized);
      
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        errors.push(`${fieldName} must use HTTPS in production`);
      }
      
      // Allow HTTP only for localhost in development
      if (urlObj.protocol === 'http:' && !urlObj.hostname.match(/^(localhost|127\.0\.0\.1|::1)$/)) {
        if (process.env.NODE_ENV === 'production') {
          errors.push(`${fieldName} must use HTTPS`);
        } else {
          warnings.push(`${fieldName} uses HTTP - should use HTTPS in production`);
        }
      }
      
      // Validate hostname
      if (urlObj.hostname.length === 0) {
        errors.push(`${fieldName} must have a valid hostname`);
      }
      
    } catch (e) {
      errors.push(`${fieldName} is not a valid URL`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: sanitized
    };
  }
  
  /**
   * Validates complete user object
   */
  static validateUser(user: any): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedUser: Partial<SecureUser> = {};
    
    if (!user || typeof user !== 'object') {
      errors.push('User must be an object');
      return { isValid: false, errors, warnings };
    }
    
    // Validate email
    const emailValidation = this.validateEmail(user.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    } else {
      sanitizedUser.email = emailValidation.sanitizedValue;
    }
    warnings.push(...emailValidation.warnings);
    
    // Validate first name
    const firstNameValidation = this.validateName(user.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      errors.push(...firstNameValidation.errors);
    } else {
      sanitizedUser.firstName = firstNameValidation.sanitizedValue;
    }
    warnings.push(...firstNameValidation.warnings);
    
    // Validate last name
    const lastNameValidation = this.validateName(user.lastName, 'Last name');
    if (!lastNameValidation.isValid) {
      errors.push(...lastNameValidation.errors);
    } else {
      sanitizedUser.lastName = lastNameValidation.sanitizedValue;
    }
    warnings.push(...lastNameValidation.warnings);
    
    // Validate SchILD ID
    const schildIdValidation = this.validateSchildId(user.schildId);
    if (!schildIdValidation.isValid) {
      errors.push(...schildIdValidation.errors);
    } else {
      sanitizedUser.schildId = schildIdValidation.sanitizedValue;
    }
    warnings.push(...schildIdValidation.warnings);
    
    // Validate user type
    if (!['student', 'teacher'].includes(user.userType)) {
      errors.push('User type must be either "student" or "teacher"');
    } else {
      sanitizedUser.userType = user.userType;
    }
    
    // Validate class (optional for students)
    if (user.klasse !== undefined) {
      const classValidation = this.validateClass(user.klasse);
      if (!classValidation.isValid) {
        errors.push(...classValidation.errors);
      } else {
        sanitizedUser.klasse = classValidation.sanitizedValue;
      }
      warnings.push(...classValidation.warnings);
    }
    
    // Set other safe properties
    sanitizedUser.id = user.id;
    sanitizedUser.enabled = Boolean(user.enabled);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: JSON.stringify(sanitizedUser)
    };
  }
  
  /**
   * Validates Keycloak configuration
   */
  static validateKeycloakConfig(config: any): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sanitizedConfig: Partial<SecureKeycloakConfig> = {};
    
    if (!config || typeof config !== 'object') {
      errors.push('Keycloak configuration must be an object');
      return { isValid: false, errors, warnings };
    }
    
    // Validate URL
    const urlValidation = this.validateUrl(config.url, 'Keycloak URL');
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors);
    } else {
      sanitizedConfig.url = urlValidation.sanitizedValue;
      sanitizedConfig.isSecure = urlValidation.sanitizedValue?.startsWith('https://');
    }
    warnings.push(...urlValidation.warnings);
    
    // Validate realm
    if (!config.realm || typeof config.realm !== 'string') {
      errors.push('Realm is required and must be a string');
    } else if (config.realm.length > SECURITY_LIMITS.MAX_REALM_LENGTH) {
      errors.push(`Realm exceeds maximum length of ${SECURITY_LIMITS.MAX_REALM_LENGTH} characters`);
    } else {
      const sanitizedRealm = config.realm.trim().replace(/[^\w\-]/g, '');
      if (sanitizedRealm.length === 0) {
        errors.push('Realm cannot be empty after sanitization');
      } else {
        sanitizedConfig.realm = sanitizedRealm;
      }
    }
    
    // Validate client ID
    if (!config.clientId || typeof config.clientId !== 'string') {
      errors.push('Client ID is required and must be a string');
    } else if (config.clientId.length > SECURITY_LIMITS.MAX_CLIENT_ID_LENGTH) {
      errors.push(`Client ID exceeds maximum length of ${SECURITY_LIMITS.MAX_CLIENT_ID_LENGTH} characters`);
    } else {
      sanitizedConfig.clientId = config.clientId.trim();
    }
    
    // Validate redirect URI
    const redirectUriValidation = this.validateUrl(config.redirectUri, 'Redirect URI');
    if (!redirectUriValidation.isValid) {
      errors.push(...redirectUriValidation.errors);
    } else {
      sanitizedConfig.redirectUri = redirectUriValidation.sanitizedValue;
    }
    warnings.push(...redirectUriValidation.warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedValue: JSON.stringify(sanitizedConfig)
    };
  }
}

// Export security utility functions
export const securityUtils = {
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  generateSecureId: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  isSecureContext: (): boolean => {
    return window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
  },
  
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type) || 
           allowedTypes.some(type => file.name.toLowerCase().endsWith(type.replace('application/', '.')));
  },
  
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }
};

export default SecurityValidator;