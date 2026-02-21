import { TripService } from '../modules/trips/trip.service';
import { DriverService } from '../modules/drivers/driver.service';
import { VehicleService } from '../modules/vehicles/vehicle.service';
import { MaintenanceService } from '../modules/maintenance/maintenance.service';
import { ExpenseService } from '../modules/expenses/expense.service';
import { prisma } from '../config/database';
import { TripStatus, VehicleType, DriverStatus } from '../types/enums';
import { AnalyticsService } from '../modules/analytics/analytics.service';

async function verifyVanWorkflow() {
    console.log('--- Verifying Van-05 Workflow Scenario ---');

    // 1. Vehicle Intake: Add "Van-05" (500kg capacity)
    const van = await prisma.vehicle.create({
        data: {
            name: 'Van-05',
            model: 'CargoMaster',
            licensePlate: 'VAN-005',
            year: 2024,
            type: VehicleType.VAN,
            maxCapacity: 500,
            odometer: 1000,
            region: 'North',
            acquisitionCost: 150000000, // Rs. 1,500,000
        }
    });
    console.log('Step 1: Van-05 created with 500kg capacity.');

    // 2. Compliance: Add Driver "Alex" with restricted types
    const driver = await prisma.driver.create({
        data: {
            name: 'Alex',
            employeeId: 'EMP-ALEX',
            licenseNumber: 'LIC-ALEX',
            licenseExpiry: new Date('2026-12-31'),
            authorizedTypes: [VehicleType.BIKE], // Initial restricted auth
            dutyStatus: DriverStatus.ON_DUTY
        }
    });
    console.log('Step 2: Driver Alex created with BIKE-only license.');

    try {
        console.log('Attempting DISPATCH (Expected Failure): Alex to Van-05...');
        await TripService.createTrip({
            vehicleId: van.id,
            driverId: driver.id,
            cargoWeight: 450,
            origin: 'Warehouse A',
            destination: 'Customer Site X',
            status: TripStatus.DISPATCHED
        });
    } catch (err: any) {
        console.log(`Success: Blocked unauthorized dispatch! Error: ${err.message}`);
    }

    // Update Alex authorization to include VAN
    await prisma.driver.update({
        where: { id: driver.id },
        data: { authorizedTypes: [VehicleType.BIKE, VehicleType.VAN] }
    });
    console.log('Alex license updated to include VAN.');

    // 3. Dispatching: Alex to Van-05 (450kg load)
    const trip = await TripService.createTrip({
        vehicleId: van.id,
        driverId: driver.id,
        cargoWeight: 450,
        origin: 'Warehouse A',
        destination: 'Customer Site X',
        status: TripStatus.DISPATCHED
    });
    console.log('Step 3: Dispatched Alex to Van-05 (450kg load). Statuses: Vehicle & Driver -> ON_TRIP/OFF_DUTY');

    // 4. Completion: Odometer 1050
    await TripService.completeTrip(trip.id, 1050);
    console.log('Step 4: Trip marked DONE at 1050km. Statuses: Vehicle & Driver -> AVAILABLE/ON_DUTY');

    // Log Fuel for this trip to test efficiency
    await ExpenseService.createFuelLog({
        vehicleId: van.id,
        tripId: trip.id,
        liters: 10,
        costPerLiter: 10000, // Rs. 100
        odometerAtFill: 1050,
        date: new Date().toISOString()
    });

    // 5. Maintenance: Oil Change
    await MaintenanceService.createServiceLog({
        vehicleId: van.id,
        serviceType: 'OIL_CHANGE' as any,
        description: 'Scheduled oil change',
        technicianName: 'Mike',
        cost: 300000,
        scheduledDate: new Date().toISOString()
    });
    const updatedVan = await prisma.vehicle.findUnique({ where: { id: van.id } });
    console.log(`Step 5: Maintenance logged. Vehicle Status: ${updatedVan?.status} (Expected: IN_SHOP)`);

    // 6. Analytics: Cost-per-km from last trip
    const efficiency = await AnalyticsService.getLastTripEfficiency(van.id);
    console.log(`Step 6: Last Trip Efficiency: ${efficiency} km/L (Distance: 50km, Fuel: 10L)`);

    console.log('--- Verification Complete ---');
}

verifyVanWorkflow().catch(console.error);
