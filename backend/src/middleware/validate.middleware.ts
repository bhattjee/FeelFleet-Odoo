import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            const errors = result.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return res.status(400).json({
                ...errorResponse('Validation failed', 'VALIDATION_ERROR'),
                errors,
            });
        }

        req.validated = result.data;
        next();
    };
};
