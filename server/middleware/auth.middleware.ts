import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/db';
import { SafeUser, UserRole } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'campus_resolve_jwt_secret_key_2026_super_secure_college_portal';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
    const user = await db.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found or token invalid.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Account has been deactivated or suspended.' });
      return;
    }

    req.user = db.toSafeUser(user);
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.', error: err.message });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

export const generateToken = (user: SafeUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
