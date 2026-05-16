/**
 * Rate Limiting Middleware
 * Prevents abuse and DDoS attacks
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: { [name: string]: RateLimitStore } = {};

/**
 * Create a rate limiter
 */
export function createRateLimiter(
  name: string,
  options: {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
    keyGenerator?: (req: any) => string; // Function to generate rate limit key
  }
) {
  if (!stores[name]) {
    stores[name] = {};
  }

  const store = stores[name];
  const { windowMs, maxRequests, keyGenerator } = options;

  return {
    middleware: (req: any, res: any, next: any) => {
      const key = keyGenerator ? keyGenerator(req) : req.ip;
      const now = Date.now();

      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 0,
          resetTime: now + windowMs
        };
      }

      store[key].count++;

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - store[key].count));
      res.setHeader('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

      if (store[key].count > maxRequests) {
        return res.status(429).json({
          error: 'Too many requests, please try again later.'
        });
      }

      next();
    }
  };
}

/**
 * API Rate Limiters
 */

export const messageLimiter = createRateLimiter('messages', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  keyGenerator: (req) => `${req.headers['x-tenant-id']}-${req.ip}`
});

export const authLimiter = createRateLimiter('auth', {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (req) => req.ip
});

export const syncLimiter = createRateLimiter('sync', {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 syncs per 5 minutes
  keyGenerator: (req) => `${req.headers['x-tenant-id']}-${req.ip}`
});

export const notificationLimiter = createRateLimiter('notifications', {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 notifications per minute
  keyGenerator: (req) => req.headers['x-tenant-id']
});

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimiters() {
  const now = Date.now();
  Object.values(stores).forEach(store => {
    Object.entries(store).forEach(([key, value]) => {
      if (value.resetTime < now) {
        delete store[key];
      }
    });
  });
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiters, 10 * 60 * 1000);
}
