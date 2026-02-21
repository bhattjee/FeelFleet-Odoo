import { z } from 'zod';
import { UserRole } from '../../types/enums';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        role: z.nativeEnum(UserRole),
        confirmPassword: z.string(),
    }),
}).refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Passwords don't match",
    path: ['body', 'confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
