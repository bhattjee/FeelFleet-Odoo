import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { DriverStatus } from '../types/enums';
import { eventEmitter } from '../events/eventEmitter';

export const runLicenseExpiryCheck = async () => {
    logger.info('Running daily license expiry check...');

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringDrivers = await prisma.driver.findMany({
        where: {
            licenseExpiry: {
                lte: thirtyDaysFromNow,
            },
            dutyStatus: { not: DriverStatus.SUSPENDED },
        },
    });

    for (const driver of expiringDrivers) {
        if (driver.licenseExpiry < today) {
            logger.warn(`Driver ${driver.name} license EXPIRED. Auto-suspending.`);
            await prisma.driver.update({
                where: { id: driver.id },
                data: { dutyStatus: DriverStatus.SUSPENDED },
            });
            eventEmitter.emit('driver.licenseExpired', { driverId: driver.id, name: driver.name });
        } else {
            logger.info(`Driver ${driver.name} license expiring soon (${driver.licenseExpiry.toDateString()}).`);
        }
    }
};
