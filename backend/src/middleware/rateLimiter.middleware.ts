import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: errorResponse('Too many login attempts. Please try again after 15 minutes.', 'RATE_LIMITED'),
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,
    message: errorResponse('Too many requests. Please try again later.', 'RATE_LIMITED'),
    standardHeaders: true,
    legacyHeaders: false,
});
