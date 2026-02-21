import { prisma } from '../../config/database';
import { TripStatus, VehicleStatus, DriverStatus } from '../../types/enums';
import { CreateTripInput } from './trip.schema';
import { eventEmitter } from '../../events/eventEmitter';
import { AppError } from '../../middleware/errorHandler.middleware';

export class TripService {
    static async getAllTrips(filters: { status?: TripStatus }) {
        return prisma.trip.findMany({
            where: filters,
            include: {
                vehicle: true,
                driver: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    static async createTrip(data: CreateTripInput) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
        if (!vehicle) throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');
        if (vehicle.status !== VehicleStatus.AVAILABLE) {
            throw new AppError(409, `Vehicle is not available (Current status: ${vehicle.status})`, 'VEHICLE_NOT_AVAILABLE');
        }
        if (vehicle.maxCapacity < data.cargoWeight) {
            throw new AppError(422, `Cargo weight ${data.cargoWeight}kg exceeds vehicle capacity of ${vehicle.maxCapacity}kg.`, 'VEHICLE_OVERLOADED');
        }

        const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
        if (!driver) throw new AppError(404, 'Driver not found', 'DRIVER_NOT_FOUND');
        if (driver.dutyStatus !== DriverStatus.ON_DUTY) {
            throw new AppError(409, `Driver is not on duty (Current status: ${driver.dutyStatus})`, 'DRIVER_NOT_READY');
        }
        if (new Date(driver.licenseExpiry) < new Date()) {
            throw new AppError(422, "Driver's license has expired. Assign a compliant driver.", 'LICENSE_EXPIRED');
        }

        // Category Compliance Check
        if (!driver.authorizedTypes.includes(vehicle.type)) {
            throw new AppError(422, `Driver is not authorized to operate ${vehicle.type} category vehicles.`, 'DRIVER_NOT_AUTHORIZED');
        }

        const isDraft = data.status === TripStatus.DRAFT;

        const trip = await prisma.$transaction(async (tx: any) => {
            const newTrip = await tx.trip.create({
                data: {
                    ...data,
                    status: data.status || TripStatus.DISPATCHED,
                    odometerStart: isDraft ? null : vehicle.odometer,
                    dispatchedAt: isDraft ? null : new Date(),
                },
            });

            if (!isDraft) {
                await tx.vehicle.update({
                    where: { id: data.vehicleId },
                    data: { status: VehicleStatus.ON_TRIP },
                });

                await tx.driver.update({
                    where: { id: data.driverId },
                    data: { dutyStatus: DriverStatus.OFF_DUTY },
                });
            }

            return newTrip;
        });

        if (!isDraft) {
            eventEmitter.emit('trip.dispatched', {
                tripId: trip.id,
                vehicleId: trip.vehicleId,
                driverId: trip.driverId,
            });
        }

        return trip;
    }

    static async completeTrip(id: string, odometerEnd: number) {
        const trip = await prisma.trip.findUnique({
            where: { id },
            include: { vehicle: true },
        });

        if (!trip) throw new AppError(404, 'Trip not found', 'TRIP_NOT_FOUND');
        if (trip.status !== TripStatus.DISPATCHED) {
            throw new AppError(409, 'Only dispatched trips can be completed', 'INVALID_TRIP_STATUS');
        }
        if (odometerEnd < (trip.odometerStart || 0)) {
            throw new AppError(422, 'End odometer cannot be less than start odometer', 'INVALID_ODOMETER');
        }

        const completedTrip = await prisma.$transaction(async (tx: any) => {
            const updatedTrip = await tx.trip.update({
                where: { id },
                data: {
                    status: TripStatus.COMPLETED,
                    odometerEnd,
                    completedAt: new Date(),
                },
            });

            await tx.vehicle.update({
                where: { id: trip.vehicleId },
                data: {
                    status: VehicleStatus.AVAILABLE,
                    odometer: odometerEnd,
                },
            });

            // Update driver performance
            const totalAssigned = await tx.trip.count({ where: { driverId: trip.driverId } });
            const completed = await tx.trip.count({
                where: { driverId: trip.driverId, status: TripStatus.COMPLETED }
            });
            const rate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 100;

            await tx.driver.update({
                where: { id: trip.driverId },
                data: {
                    dutyStatus: DriverStatus.ON_DUTY,
                    completedTrips: completed,
                    completionRate: Number(rate.toFixed(1)),
                },
            });

            return updatedTrip;
        });

        eventEmitter.emit('trip.completed', {
            tripId: id,
            vehicleId: trip.vehicleId,
            driverId: trip.driverId,
            odometerEnd,
        });

        return completedTrip;
    }

    static async cancelTrip(id: string) {
        const trip = await prisma.trip.findUnique({ where: { id } });
        if (!trip) throw new AppError(404, 'Trip not found', 'TRIP_NOT_FOUND');

        if (trip.status !== TripStatus.DRAFT && trip.status !== TripStatus.DISPATCHED) {
            throw new AppError(409, 'Only draft or dispatched trips can be cancelled', 'INVALID_TRIP_STATUS');
        }

        return prisma.$transaction(async (tx: any) => {
            if (trip.status === TripStatus.DISPATCHED) {
                await tx.vehicle.update({
                    where: { id: trip.vehicleId },
                    data: { status: VehicleStatus.AVAILABLE },
                });
                await tx.driver.update({
                    where: { id: trip.driverId },
                    data: { dutyStatus: DriverStatus.ON_DUTY },
                });
            }

            const updatedTrip = await tx.trip.update({
                where: { id },
                data: { status: TripStatus.CANCELLED },
            });

            // Recalculate completion rate
            const totalAssigned = await tx.trip.count({ where: { driverId: trip.driverId } });
            const completed = await tx.trip.count({
                where: { driverId: trip.driverId, status: TripStatus.COMPLETED }
            });
            const rate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 100;

            await tx.driver.update({
                where: { id: trip.driverId },
                data: {
                    completionRate: Number(rate.toFixed(1)),
                },
            });

            return updatedTrip;
        });
    }
}
