import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { DriverStatus, TripStatus } from '../../types/enums';
import { CreateDriverInput, UpdateDriverInput } from './driver.schema';
import { isExpiringSoon, isExpired } from '../../utils/dateHelpers';

export class DriverService {
    static async getAllDrivers(filters: { dutyStatus?: DriverStatus }) {
        const drivers = await prisma.driver.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });

        return drivers.map((driver: any) => ({
            ...driver,
            licenseExpiryStatus: isExpired(driver.licenseExpiry)
                ? 'EXPIRED'
                : isExpiringSoon(driver.licenseExpiry)
                    ? 'EXPIRING'
                    : 'VALID',
        }));
    }

    static async getAvailableDrivers() {
        return prisma.driver.findMany({
            where: {
                dutyStatus: DriverStatus.ON_DUTY,
                licenseExpiry: {
                    gt: new Date(),
                },
            },
        });
    }

    static async createDriver(data: CreateDriverInput) {
        return prisma.driver.create({
            data: {
                ...data,
                dutyStatus: DriverStatus.ON_DUTY,
            },
        });
    }

    static async updateDriver(id: string, data: UpdateDriverInput) {
        return prisma.driver.update({
            where: { id },
            data,
        });
    }

    static async updateDutyStatus(id: string, status: DriverStatus) {
        const driver = await prisma.driver.findUnique({ where: { id } });
        if (!driver) throw new AppError(404, 'Driver not found', 'DRIVER_NOT_FOUND');

        if (status === DriverStatus.SUSPENDED) {
            const activeTrips = await prisma.trip.count({
                where: { driverId: id, status: TripStatus.DISPATCHED },
            });

            if (activeTrips > 0) {
                throw new AppError(409, 'Cannot suspend driver with active trip in progress', 'ACTIVE_TRIP_EXIST');
            }

            // Cancel draft trips
            await prisma.trip.updateMany({
                where: { driverId: id, status: TripStatus.DRAFT },
                data: { status: TripStatus.CANCELLED },
            });
        }

        return prisma.driver.update({
            where: { id },
            data: { dutyStatus: status },
        });
    }

    static async checkLicenseCompliance(driverId: string) {
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        if (!driver) throw new AppError(404, 'Driver not found', 'DRIVER_NOT_FOUND');

        if (isExpired(driver.licenseExpiry)) {
            throw new AppError(422, "Driver's license has expired.", 'LICENSE_EXPIRED');
        }

        return true;
    }
}
