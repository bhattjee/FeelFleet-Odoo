import { prisma } from '../../config/database';
import { ExpenseType } from '../../types/enums';
import { CreateExpenseInput, CreateFuelLogInput } from './expense.schema';

export class ExpenseService {
    static async getAllExpenses(filters: { vehicleId?: string; type?: ExpenseType }) {
        return prisma.expense.findMany({
            where: filters,
            include: {
                vehicle: true,
                trip: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    static async createExpense(data: CreateExpenseInput) {
        return prisma.expense.create({
            data: {
                vehicleId: data.vehicleId,
                tripId: data.tripId,
                type: data.type,
                totalCost: data.amount,
                description: data.description,
                date: new Date(data.date),
                receiptRef: data.receiptRef,
            },
        });
    }

    static async createFuelLog(data: CreateFuelLogInput) {
        const totalCost = Math.round(data.liters * data.costPerLiter);

        return prisma.expense.create({
            data: {
                vehicleId: data.vehicleId,
                tripId: data.tripId,
                type: ExpenseType.FUEL,
                liters: data.liters,
                costPerLiter: data.costPerLiter,
                totalCost,
                odometerAtFill: data.odometerAtFill,
                date: new Date(data.date),
            },
        });
    }

    static async getTotalCostByVehicle(vehicleId: string) {
        const expenses = await prisma.expense.aggregate({
            where: { vehicleId },
            _sum: { totalCost: true },
        });

        const maintenanceLogs = await prisma.maintenanceLog.aggregate({
            where: { vehicleId, status: 'COMPLETED' },
            _sum: { cost: true },
        });

        const fuelTotal = await prisma.expense.aggregate({
            where: { vehicleId, type: ExpenseType.FUEL },
            _sum: { totalCost: true },
        });

        const vehicle = await prisma.vehicle.findUnique({
            where: { id: vehicleId },
            select: { odometer: true, acquisitionCost: true },
        });

        const grandTotal = (expenses._sum.totalCost || 0) + (maintenanceLogs._sum.cost || 0);

        return {
            fuelTotal: fuelTotal._sum.totalCost || 0,
            maintenanceTotal: maintenanceLogs._sum.cost || 0,
            grandTotal,
            costPerKm: vehicle?.odometer ? grandTotal / vehicle.odometer : 0,
        };
    }
}
