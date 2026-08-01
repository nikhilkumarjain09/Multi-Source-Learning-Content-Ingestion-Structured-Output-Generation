import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from './authService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.split(' ')[1]
    : (req.headers['x-access-token'] as string) || (req.query.token as string);

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired access token.' });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (req.user.role !== role) {
      res.status(403).json({ error: `Forbidden. Requires ${role} role permissions.` });
      return;
    }
    next();
  };
}
