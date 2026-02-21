import { prisma } from '../../config/database';
import { VehicleStatus, TripStatus, VehicleType } from '../../types/enums';

export class AnalyticsService {
    static async getDashboardKPIs(filters: { region?: string; type?: VehicleType; status?: VehicleStatus } = {}) {
        const vehicleWhere: any = {};
        if (filters.region) vehicleWhere.region = filters.region;
        if (filters.type) vehicleWhere.type = filters.type;
        if (filters.status) vehicleWhere.status = filters.status;

        const tripWhere: any = {};
        if (filters.region) tripWhere.region = filters.region;
        if (filters.status) {
            if (filters.status === VehicleStatus.ON_TRIP) tripWhere.status = TripStatus.DISPATCHED;
            // More mapping if needed
        }

        const [activeFleet, maintenanceAlerts, pendingCargo, totalNonRetired] = await Promise.all([
            prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.ON_TRIP } }),
            prisma.vehicle.count({ where: { ...vehicleWhere, status: VehicleStatus.IN_SHOP } }),
            prisma.trip.count({ where: { ...tripWhere, status: TripStatus.DRAFT } }),
            prisma.vehicle.count({ where: { ...vehicleWhere, status: { not: VehicleStatus.RETIRED } } }),
        ]);

        const utilizationRate = totalNonRetired > 0
            ? (activeFleet / totalNonRetired) * 100
            : 0;

        return {
            activeFleet,
            maintenanceAlerts,
            utilizationRate: Math.round(utilizationRate),
            pendingCargo,
        };
    }

    static async getFuelEfficiencyPerVehicle() {
        // Basic implementation - could be more complex with date filters
        const vehicles = await prisma.vehicle.findMany({
            where: { trips: { some: { status: TripStatus.COMPLETED } } },
            include: {
                expenses: {
                    where: { type: 'FUEL' },
                },
                trips: {
                    where: { status: TripStatus.COMPLETED },
                },
            },
        });

        return vehicles.map((v: any) => {
            const totalKm = v.trips.reduce((acc: number, t: any) => acc + ((t.odometerEnd || 0) - (t.odometerStart || 0)), 0);
            const totalLiters = v.expenses.reduce((acc: number, e: any) => acc + (e.liters || 0), 0);

            return {
                vehicleId: v.id,
                licensePlate: v.licensePlate,
                kmPerLiter: totalLiters > 0 ? Number((totalKm / totalLiters).toFixed(2)) : 0,
            };
        });
    }

    static async getFinancialSummary() {
        const [revenue, fuel, maintenance, totalInvestment] = await Promise.all([
            prisma.trip.aggregate({ _sum: { revenue: true } }),
            prisma.expense.aggregate({ where: { type: 'FUEL' }, _sum: { totalCost: true } }),
            prisma.expense.aggregate({ where: { type: 'MAINTENANCE' }, _sum: { totalCost: true } }),
            prisma.vehicle.aggregate({ _sum: { acquisitionCost: true } }),
        ]);

        const totalRevenue = revenue._sum.revenue || 0;
        const totalFuel = fuel._sum.totalCost || 0;
        const totalMaintenance = maintenance._sum.totalCost || 0;
        const netProfit = totalRevenue - (totalFuel + totalMaintenance);
        const acquisitionTotal = totalInvestment._sum.acquisitionCost || 0;

        return {
            totalRevenue,
            totalFuel,
            totalMaintenance,
            netProfit,
            // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
            roi: acquisitionTotal > 0 ? (netProfit / acquisitionTotal) * 100 : 0
        };
    }

    static async getFuelEfficiencyTrend() {
        const completedTrips = await prisma.trip.findMany({
            where: { status: TripStatus.COMPLETED, dispatchedAt: { not: null } },
            orderBy: { dispatchedAt: 'asc' },
        });

        const fuelExpenses = await prisma.expense.findMany({
            where: { type: 'FUEL' },
        });

        // Group by month
        const monthlyData: Record<string, { km: number; liters: number }> = {};

        completedTrips.forEach((t: any) => {
            const date = new Date(t.dispatchedAt);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = { km: 0, liters: 0 };
            monthlyData[month].km += (t.odometerEnd || 0) - (t.odometerStart || 0);
        });

        fuelExpenses.forEach((e: any) => {
            const date = new Date(e.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (monthlyData[month]) {
                monthlyData[month].liters += e.liters || 0;
            }
        });

        return Object.keys(monthlyData).map(month => ({
            month,
            kmL: monthlyData[month].liters > 0 ? Number((monthlyData[month].km / monthlyData[month].liters).toFixed(2)) : 0
        }));
    }

    static async getTopCostlyVehicles() {
        const vehicles = await prisma.vehicle.findMany({
            include: {
                expenses: true,
                maintenanceLogs: {
                    where: { status: 'COMPLETED' }
                }
            },
        });

        const costly = vehicles.map((v: any) => {
            const expenseCost = v.expenses.reduce((acc: number, e: any) => acc + (e.totalCost || 0), 0);
            const maintenanceCost = v.maintenanceLogs.reduce((acc: number, m: any) => acc + (m.cost || 0), 0);
            return {
                vehicle: v.licensePlate,
                cost: (expenseCost + maintenanceCost) / 100, // Convert to major currency
            };
        });

        return costly.sort((a: any, b: any) => b.cost - a.cost).slice(0, 5);
    }

    static async getLastTripEfficiency(vehicleId: string) {
        const lastTrip = await prisma.trip.findFirst({
            where: { vehicleId, status: TripStatus.COMPLETED, odometerEnd: { not: null } },
            orderBy: { completedAt: 'desc' },
        });

        if (!lastTrip || !lastTrip.odometerStart || !lastTrip.odometerEnd) return 0;

        const distance = lastTrip.odometerEnd - lastTrip.odometerStart;

        // Find fuel logged for this trip specifically
        const fuelLog = await prisma.expense.findFirst({
            where: { tripId: lastTrip.id, type: 'FUEL' },
        });

        if (!fuelLog || !fuelLog.liters) return 0;

        return Number((distance / fuelLog.liters).toFixed(2));
    }
}
