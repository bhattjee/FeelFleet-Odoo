import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { successResponse } from '../../utils/apiResponse';
import { env } from '../../config/env';

const setAuthCookie = (res: Response, userId: string, role: string) => {
    const accessToken = AuthService.generateAccessToken(userId, role as any);
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    });
};

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, name, role } = req.validated!.body;

            const user = await AuthService.createUser({ email, password, name, role });

            setAuthCookie(res, user.id, user.role);

            return res.json(
                successResponse({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                }),
            );
        } catch (err) {
            next(err);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.validated!.body;

            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user || !(await AuthService.comparePassword(password, user.password))) {
                throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
            }

            setAuthCookie(res, user.id, user.role);

            return res.json(
                successResponse({
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    },
                }),
            );
        } catch (err) {
            next(err);
        }
    }

    static async logout(_req: Request, res: Response) {
        res.clearCookie('access_token');
        return res.json(successResponse({ message: 'Logged out successfully' }));
    }

    static async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
            }

            const user = await AuthService.getUserById(req.user.userId);
            return res.json(successResponse({ user }));
        } catch (err) {
            next(err);
        }
    }
}
