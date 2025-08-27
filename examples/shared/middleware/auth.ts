/**
 * Authentication middleware for example applications
 */

import { Request, Response, NextFunction } from 'express';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { createLogger } from '../utils/logger';

const logger = createLogger('auth-middleware');

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
  };
}

/**
 * Simple API key authentication middleware
 */
export function apiKeyAuth(validApiKeys?: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      logger.warn('Missing API key in request', { 
        path: req.path, 
        ip: req.ip 
      });
      return sendUnauthorized(res, 'API key required');
    }

    // If no valid keys provided, use environment variable
    const keys = validApiKeys || [process.env.API_KEY];
    
    if (!keys.includes(apiKey)) {
      logger.warn('Invalid API key used', { 
        path: req.path, 
        ip: req.ip,
        apiKey: apiKey.substring(0, 8) + '...' // Log only first 8 chars for security
      });
      return sendUnauthorized(res, 'Invalid API key');
    }

    // Set a basic user context
    req.user = {
      id: 'api-user',
      email: 'api@example.com',
      name: 'API User',
      roles: ['api'],
      permissions: ['read', 'write'],
    };

    next();
  };
}

/**
 * Basic authentication middleware
 */
export function basicAuth(validCredentials: { username: string; password: string }[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Example App"');
      return sendUnauthorized(res, 'Basic authentication required');
    }

    try {
      const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
      const [username, password] = credentials.split(':');

      const validCredential = validCredentials.find(
        cred => cred.username === username && cred.password === password
      );

      if (!validCredential) {
        logger.warn('Invalid credentials used', { 
          username,
          path: req.path, 
          ip: req.ip 
        });
        return sendUnauthorized(res, 'Invalid credentials');
      }

      // Set user context
      req.user = {
        id: username,
        email: `${username}@example.com`,
        name: username,
        roles: ['user'],
        permissions: ['read', 'write'],
      };

      next();
    } catch (error) {
      logger.error('Error parsing basic auth credentials', error);
      return sendUnauthorized(res, 'Invalid authorization header');
    }
  };
}

/**
 * Role-based access control middleware
 */
export function requireRole(requiredRoles: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRole) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        userRoles: req.user.roles,
        requiredRoles: roles,
        path: req.path,
      });
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
}

/**
 * Permission-based access control middleware
 */
export function requirePermission(requiredPermissions: string | string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasPermission = permissions.some(permission => req.user!.permissions.includes(permission));

    if (!hasPermission) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        userPermissions: req.user.permissions,
        requiredPermissions: permissions,
        path: req.path,
      });
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Adds user context if authentication is provided, but doesn't require it
 */
export function optionalAuth(validApiKeys?: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next(); // No authentication provided, continue
    }

    const keys = validApiKeys || [process.env.API_KEY];
    
    if (keys.includes(apiKey)) {
      req.user = {
        id: 'api-user',
        email: 'api@example.com',
        name: 'API User',
        roles: ['api'],
        permissions: ['read', 'write'],
      };
    }

    next();
  };
}

/**
 * IP whitelist middleware
 */
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    // Handle localhost and IPv6 localhost
    const normalizedIP = clientIP === '::1' || clientIP === '::ffff:127.0.0.1' ? '127.0.0.1' : clientIP;
    
    if (!allowedIPs.includes(normalizedIP)) {
      logger.warn('Access denied - IP not whitelisted', {
        clientIP: normalizedIP,
        path: req.path,
        allowedIPs,
      });
      return sendForbidden(res, 'Access denied from this IP address');
    }

    next();
  };
}

/**
 * Demo mode middleware - adds demo user context
 */
export function demoMode() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      roles: ['demo', 'user'],
      permissions: ['read'],
    };

    next();
  };
}

/**
 * Request logging middleware with user context
 */
export function requestLogging() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    });

    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
  };
}