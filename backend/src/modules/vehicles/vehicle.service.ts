import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { VehicleStatus, TripStatus } from '../../types/enums';
import { CreateVehicleInput, UpdateVehicleInput } from './vehicle.schema';

export class VehicleService {
    static async getAllVehicles(filters: { status?: VehicleStatus; type?: any }) {
        return prisma.vehicle.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });
    }

    static async getVehicleById(id: string) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                trips: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                maintenanceLogs: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!vehicle) {
            throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');
        }

        return vehicle;
    }

    static async createVehicle(data: CreateVehicleInput) {
        return prisma.vehicle.create({
            data: {
                ...data,
                status: VehicleStatus.AVAILABLE,
            },
        });
    }

    static async updateVehicle(id: string, data: UpdateVehicleInput) {
        const vehicle = await this.getVehicleById(id);

        if (data.status && data.status === VehicleStatus.RETIRED) {
            // Cancel draft trips if retiring
            await prisma.trip.updateMany({
                where: { vehicleId: id, status: TripStatus.DRAFT },
                data: { status: TripStatus.CANCELLED },
            });
        }

        return prisma.vehicle.update({
            where: { id },
            data,
        });
    }

    static async retireVehicle(id: string) {
        const activeTrips = await prisma.trip.count({
            where: { vehicleId: id, status: TripStatus.DISPATCHED },
        });

        if (activeTrips > 0) {
            throw new AppError(409, 'Cannot retire vehicle with active trips', 'ACTIVE_TRIPS_EXIST');
        }

        return prisma.vehicle.update({
            where: { id },
            data: { status: VehicleStatus.RETIRED },
        });
    }

    static async getAvailableVehicles() {
        return prisma.vehicle.findMany({
            where: { status: VehicleStatus.AVAILABLE },
        });
    }
}
