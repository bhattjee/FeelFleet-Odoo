import { prisma } from '../../config/database';
import { VehicleStatus } from '../../types/enums';
import { CreateServiceLogInput, CompleteServiceInput } from './maintenance.schema';
import { eventEmitter } from '../../events/eventEmitter';
import { AppError } from '../../middleware/errorHandler.middleware';

export class MaintenanceService {
    static async getAllServiceLogs(filters: { vehicleId?: string; status?: string }) {
        return prisma.maintenanceLog.findMany({
            where: filters,
            include: { vehicle: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async createServiceLog(data: CreateServiceLogInput) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');

        const openLog = await prisma.maintenanceLog.findFirst({
            where: { vehicleId: data.vehicleId, status: 'IN_PROGRESS' },
        });

        if (openLog) {
            throw new AppError(409, 'Vehicle already has an open service log. Close it before creating a new one.', 'OPEN_LOG_EXISTS');
        }

        const log = await prisma.$transaction(async (tx: any) => {
            const newLog = await tx.maintenanceLog.create({
                data: {
                    ...data,
                    status: 'IN_PROGRESS',
                },
            });

            await tx.vehicle.update({
                where: { id: data.vehicleId },
                data: { status: VehicleStatus.IN_SHOP },
            });

            return newLog;
        });

        eventEmitter.emit('vehicle.inShop', {
            vehicleId: vehicle.id,
            plate: vehicle.licensePlate,
        });

        return log;
    }

    static async completeService(id: string, data: CompleteServiceInput) {
        const log = await prisma.maintenanceLog.findUnique({ where: { id } });
        if (!log) throw new AppError(404, 'Service log not found', 'LOG_NOT_FOUND');

        return prisma.$transaction(async (tx: any) => {
            const updatedLog = await tx.maintenanceLog.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    completedDate: new Date(data.completedDate),
                    cost: data.finalCost || log.cost,
                },
            });

            await tx.vehicle.update({
                where: { id: log.vehicleId },
                data: { status: VehicleStatus.AVAILABLE },
            });

            eventEmitter.emit('vehicle.available', {
                vehicleId: log.vehicleId,
                plate: '', // We could fetch it if needed
            });

            return updatedLog;
        });
    }
}
