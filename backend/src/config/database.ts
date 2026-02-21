import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
    });

if (env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
