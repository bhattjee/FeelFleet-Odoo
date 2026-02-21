import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler.middleware';
import { UserRole } from '../../types/enums';

export class AuthService {
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    static async comparePassword(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }

    static generateAccessToken(userId: string, role: UserRole): string {
        return jwt.sign({ userId, role }, env.JWT_SECRET as string, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });
    }

    static async getUserById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
        }

        return user;
    }

    static async createUser(data: { email: string; password: string; name: string; role: UserRole }) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
        }
        const hashedPassword = await this.hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
            },
            select: { id: true, email: true, name: true, role: true },
        });
        return user;
    }
}
