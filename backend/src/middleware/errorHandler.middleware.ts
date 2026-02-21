import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: string,
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
) => {
    logger.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json(errorResponse(err.message, err.code));
    }

    const errorAny = err as any;
    if (errorAny.code && (errorAny.clientVersion || errorAny.meta)) {
        // Unique constraint violation
        if (errorAny.code === 'P2002') {
            const field = (errorAny.meta?.target as string[])?.join(', ') || 'field';
            return res.status(409).json(
                errorResponse(`A record with this ${field} already exists`, 'DUPLICATE_RECORD'),
            );
        }
        // Record not found
        if (errorAny.code === 'P2025') {
            return res.status(404).json(errorResponse('Record not found', 'NOT_FOUND'));
        }
    }

    // Default to 500
    const statusCode = 500;
    const message = 'Internal server error';
    const code = 'INTERNAL_SERVER_ERROR';

    return res.status(statusCode).json(errorResponse(message, code));
};
