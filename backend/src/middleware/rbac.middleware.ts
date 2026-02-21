import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/enums';
import { AppError } from './errorHandler.middleware';

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Unauthorized', 'AUTH_REQUIRED'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'Forbidden', 'INSUFFICIENT_PERMISSIONS'));
        }

        next();
    };
};
