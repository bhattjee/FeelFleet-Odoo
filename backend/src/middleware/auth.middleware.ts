import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { errorResponse } from '../utils/apiResponse';
import { AppError } from './errorHandler.middleware';
import { UserRole } from '../types/enums';

interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (req.headers.cookie?.split(';').find(c => c.trim().startsWith('access_token='))?.split('=')[1] || null);

  if (!token) {
    return next(new AppError(401, 'Unauthorized', 'AUTH_REQUIRED'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Session expired. Please log in again.', 'TOKEN_EXPIRED'));
    }
    return next(new AppError(401, 'Invalid token', 'INVALID_TOKEN'));
  }
};
