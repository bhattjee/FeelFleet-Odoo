import { PrismaClient, VehicleType, VehicleStatus, TripStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Command Center Test Data ---');

    // 1. Create Vehicles in different regions
    const v1 = await prisma.vehicle.upsert({
        where: { licensePlate: 'VERIFY-01' },
        update: {},
        create: {
            name: 'Truck West 1',
            model: 'Ashok Leyland',
            licensePlate: 'VERIFY-01',
            year: 2023,
            type: VehicleType.TRUCK,
            maxCapacity: 20000,
            odometer: 1000,
            status: VehicleStatus.ON_TRIP,
            region: 'West',
        },
    });

    const v2 = await prisma.vehicle.upsert({
        where: { licensePlate: 'VERIFY-02' },
        update: {},
        create: {
            name: 'Van East 1',
            model: 'Tata Ace',
            licensePlate: 'VERIFY-02',
            year: 2022,
            type: VehicleType.VAN,
            maxCapacity: 3000,
            odometer: 500,
            status: VehicleStatus.IN_SHOP,
            region: 'East',
        },
    });

    console.log('Seeded vehicles:', v1.licensePlate, v2.licensePlate);

    // 2. Verify West Region KPIs (Should show 1 active fleet)
    console.log('Verifying West Region KPIs...');
    // Note: We can manually call the service or mock a request if we had a runner.
    // For now, this script serves as documentation of the data used for verification.
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
