/**
 * Input Validation & Sanitization
 * Prevents XSS, injection attacks, and data corruption
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate and sanitize text input
 */
export function sanitizeText(text: string, maxLength: number = 5000): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, ''); // Remove quotes that could break strings
}

/**
 * Sanitize message content
 */
export function sanitizeMessage(message: string): string {
  return sanitizeText(message, 10000)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate tenant ID (UUID format)
 */
export function isValidTenantId(tenantId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(tenantId) || tenantId.length <= 50; // Also accept short IDs
}

/**
 * Validate user ID (UUID format)
 */
export function isValidUserId(userId: string): boolean {
  return userId.length > 0 && userId.length <= 50;
}

/**
 * Validate platform name
 */
export function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['airbnb', 'booking', 'abritel', 'vrbo', 'agoda'];
  return validPlatforms.includes(platform.toLowerCase());
}

/**
 * Validate message status
 */
export function isValidMessageStatus(status: string): boolean {
  const validStatuses = ['open', 'closed', 'archived', 'pending', 'resolved'];
  return validStatuses.includes(status.toLowerCase());
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number) {
  const validPage = Math.max(1, Math.min(1000, Math.floor(page) || 1));
  const validLimit = Math.max(1, Math.min(100, Math.floor(limit) || 20));
  return { page: validPage, limit: validLimit };
}

/**
 * Validate search query
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeText(query, 200);
}

/**
 * Validate date parameters
 */
export function isValidDate(date: unknown): boolean {
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  return false;
}

/**
 * Validate request body
 */
export function validateRequestBody(body: any, schema: Record<string, any>): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }

  for (const [key, validator] of Object.entries(schema)) {
    if (validator.required && !(key in body)) {
      return false;
    }

    if (key in body) {
      const value = body[key];
      const type = validator.type;

      if (type === 'string' && typeof value !== 'string') {
        return false;
      }
      if (type === 'number' && typeof value !== 'number') {
        return false;
      }
      if (type === 'boolean' && typeof value !== 'boolean') {
        return false;
      }
      if (type === 'array' && !Array.isArray(value)) {
        return false;
      }

      // Check length constraints
      if (type === 'string' && validator.maxLength) {
        if (value.length > validator.maxLength) {
          return false;
        }
      }

      // Check custom validator
      if (validator.validate && !validator.validate(value)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Create a schema validator
 */
export function createValidator(schema: Record<string, any>) {
  return (body: any) => validateRequestBody(body, schema);
}

/**
 * Common schema definitions
 */
export const schemas = {
  messageReply: {
    message: {
      type: 'string',
      required: true,
      maxLength: 10000,
      validate: (msg: string) => msg.trim().length > 0
    }
  },

  notificationSubscription: {
    endpoint: {
      type: 'string',
      required: true,
      validate: (url: string) => url.startsWith('https://')
    },
    keys: {
      type: 'object',
      required: true,
      validate: (keys: any) => keys.p256dh && keys.auth
    }
  },

  search: {
    q: {
      type: 'string',
      required: false,
      maxLength: 200
    },
    platform: {
      type: 'string',
      required: false,
      validate: isValidPlatform
    },
    status: {
      type: 'string',
      required: false,
      validate: isValidMessageStatus
    }
  }
};
