import { MaintenanceService } from '../backend/src/modules/maintenance/maintenance.service';
import { prisma } from '../backend/src/config/database';

async function verifyMaintenance() {
    console.log('--- Verifying Maintenance Lifecycle ---');

    // 1. Get an available vehicle
    const vehicle = await prisma.vehicle.findFirst({ where: { status: 'AVAILABLE' } });
    if (!vehicle) {
        console.log('No available vehicle found to test. Skipping.');
        return;
    }
    console.log(`Using vehicle: ${vehicle.licensePlate} (${vehicle.status})`);

    // 2. Create service log
    const log = await MaintenanceService.createServiceLog({
        vehicleId: vehicle.id,
        serviceType: 'OIL_CHANGE',
        scheduledDate: new Date(),
        description: 'Test service',
        technicianName: 'Test Tech',
        cost: 1000,
    });
    console.log(`Service log created. Status: ${log.status}`);

    // 3. Check vehicle status (should be IN_SHOP)
    const updatedVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    console.log(`Vehicle status after logging: ${updatedVehicle?.status}`);

    // 4. Complete service log
    await MaintenanceService.completeService(log.id, {
        completedDate: new Date(),
        finalCost: 1200,
    });
    console.log('Service log completed.');

    // 5. Check vehicle status (should be AVAILABLE)
    const finalVehicle = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    console.log(`Vehicle status after completion: ${finalVehicle?.status}`);

    console.log('--- Verification Complete ---');
}

verifyMaintenance().catch(console.error);
