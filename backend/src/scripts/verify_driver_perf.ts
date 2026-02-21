import { DriverService } from '../backend/src/modules/drivers/driver.service';
import { TripService } from '../backend/src/modules/trips/trip.service';
import { prisma } from '../backend/src/config/database';
import { DriverStatus, TripStatus } from '../backend/src/types/enums';

async function verifyDriverPerformance() {
    console.log('--- Verifying Driver Performance & Status ---');

    // 1. Get a driver
    const driver = await prisma.driver.findFirst();
    if (!driver) {
        console.log('No driver found. Skipping.');
        return;
    }

    // 2. Test status toggle
    console.log(`Initial status: ${driver.dutyStatus}`);
    await DriverService.updateDutyStatus(driver.id, DriverStatus.OFF_DUTY);
    const updated = await prisma.driver.findUnique({ where: { id: driver.id } });
    console.log(`Updated status: ${updated?.dutyStatus}`);

    // 3. Test completion rate
    // Get a vehicle for trip
    const vehicle = await prisma.vehicle.findFirst();
    if (!vehicle) return;

    console.log(`Initial rate: ${driver.completionRate}%`);

    // Create a trip
    const trip = await TripService.createTrip({
        vehicleId: vehicle.id,
        driverId: driver.id,
        origin: 'A',
        destination: 'B',
        cargoWeight: 100,
        status: TripStatus.DISPATCHED
    });

    // Complete it
    await TripService.completeTrip(trip.id, (vehicle.odometer || 0) + 50);
    const afterTrip = await prisma.driver.findUnique({ where: { id: driver.id } });
    console.log(`Rate after 1 completion: ${afterTrip?.completionRate}% (Assigned: 1, Completed: 1)`);

    // Cancel a trip
    const trip2 = await TripService.createTrip({
        vehicleId: vehicle.id,
        driverId: driver.id,
        origin: 'A',
        destination: 'C',
        cargoWeight: 50,
        status: TripStatus.DISPATCHED
    });
    await TripService.cancelTrip(trip2.id);
    const afterCancel = await prisma.driver.findUnique({ where: { id: driver.id } });
    console.log(`Rate after cancellation: ${afterCancel?.completionRate}% (Assigned: 2, Completed: 1)`);

    console.log('--- Verification Complete ---');
}

verifyDriverPerformance().catch(console.error);
