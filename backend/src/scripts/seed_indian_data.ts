import { PrismaClient, VehicleType, VehicleStatus, TripStatus, DriverStatus, ExpenseType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data with Indian context...');

    // 1. Clear existing data
    await prisma.expense.deleteMany({});
    await prisma.maintenanceLog.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.driver.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('password123', 12);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@feelfleet.in',
            password: hashedPassword,
            name: 'Rajesh Sharma',
            role: 'MANAGER',
        },
    });

    const dispatcher = await prisma.user.create({
        data: {
            email: 'prakash@feelfleet.in',
            password: hashedPassword,
            name: 'Prakash Ghadge',
            role: 'DISPATCHER',
        },
    });

    // 3. Create Vehicles
    const vehicles = await prisma.vehicle.createMany({
        data: [
            {
                name: 'Tata Ultra EX',
                model: 'Ultra 1918.T',
                licensePlate: 'MH-12-PQ-4567',
                year: 2023,
                type: VehicleType.TRUCK,
                maxCapacity: 10000,
                odometer: 15420,
                status: VehicleStatus.AVAILABLE,
                region: 'Pune',
                acquisitionCost: 285000000, // 28.5L in paisa
            },
            {
                name: 'Mahindra Bolero Pick-up',
                model: 'Bolero City',
                licensePlate: 'DL-01-AB-8901',
                year: 2022,
                type: VehicleType.VAN,
                maxCapacity: 1500,
                odometer: 42300,
                status: VehicleStatus.ON_TRIP,
                region: 'Delhi',
                acquisitionCost: 95000000, // 9.5L
            },
            {
                name: 'Tata Ace Gold',
                model: 'Ace CNG',
                licensePlate: 'KA-05-MN-2345',
                year: 2024,
                type: VehicleType.VAN,
                maxCapacity: 750,
                odometer: 1200,
                status: VehicleStatus.AVAILABLE,
                region: 'Bangalore',
                acquisitionCost: 55000000, // 5.5L
            },
            {
                name: 'Ashok Leyland Dost',
                model: 'Dost Strong',
                licensePlate: 'TN-07-XY-6789',
                year: 2021,
                type: VehicleType.VAN,
                maxCapacity: 1250,
                odometer: 65000,
                status: VehicleStatus.IN_SHOP,
                region: 'Chennai',
                acquisitionCost: 78000000, // 7.8L
            },
            {
                name: 'Hero Splendor',
                model: 'Splendor Plus',
                licensePlate: 'HR-26-ZZ-9999',
                year: 2023,
                type: VehicleType.BIKE,
                maxCapacity: 50,
                odometer: 8500,
                status: VehicleStatus.AVAILABLE,
                region: 'Gurgaon',
                acquisitionCost: 8500000, // 85k
            },
        ],
    });

    const allVehicles = await prisma.vehicle.findMany();

    // 4. Create Drivers
    const drivers = await prisma.driver.createMany({
        data: [
            {
                name: 'Amit Kumar',
                employeeId: 'EMP-001',
                licenseNumber: 'DL-1234567890',
                licenseExpiry: new Date('2028-12-31'),
                authorizedTypes: [VehicleType.TRUCK, VehicleType.VAN],
                dutyStatus: DriverStatus.ON_DUTY,
                phone: '9876543210',
            },
            {
                name: 'Suresh Patil',
                employeeId: 'EMP-002',
                licenseNumber: 'MH-0987654321',
                licenseExpiry: new Date('2025-06-15'),
                authorizedTypes: [VehicleType.VAN],
                dutyStatus: DriverStatus.ON_DUTY,
                phone: '9123456789',
            },
            {
                name: 'Rahul Verma',
                employeeId: 'EMP-003',
                licenseNumber: 'KA-1122334455',
                licenseExpiry: new Date('2024-03-20'), // Soon to expire
                authorizedTypes: [VehicleType.VAN, VehicleType.BIKE],
                dutyStatus: DriverStatus.OFF_DUTY,
                phone: '9988776655',
            },
            {
                name: 'Vijay Singh',
                employeeId: 'EMP-004',
                licenseNumber: 'UP-5544332211',
                licenseExpiry: new Date('2023-11-10'), // Expired
                authorizedTypes: [VehicleType.TRUCK],
                dutyStatus: DriverStatus.SUSPENDED,
                phone: '8877665544',
            },
        ],
    });

    const allDrivers = await prisma.driver.findMany();

    // 5. Create Trips
    const activeVehicle = allVehicles.find(v => v.status === VehicleStatus.ON_TRIP);
    const activeDriver = allDrivers.find(d => d.dutyStatus === DriverStatus.ON_DUTY);

    if (activeVehicle && activeDriver) {
        await prisma.trip.create({
            data: {
                vehicleId: activeVehicle.id,
                driverId: activeDriver.id,
                origin: 'Indira Nagar, Bangalore',
                destination: 'Whitefield, Bangalore',
                cargoWeight: 1200,
                status: TripStatus.DISPATCHED,
                revenue: 450000, // Rs. 4500
                dispatchedAt: new Date(),
            },
        });
    }

    // Completed Trip
    const idleVehicle = allVehicles.find(v => v.status === VehicleStatus.AVAILABLE);
    if (idleVehicle && activeDriver) {
        await prisma.trip.create({
            data: {
                vehicleId: idleVehicle.id,
                driverId: activeDriver.id,
                origin: 'Dharavi, Mumbai',
                destination: 'JNPT Port, Navi Mumbai',
                cargoWeight: 8500,
                status: TripStatus.COMPLETED,
                revenue: 1250000, // Rs. 12,500
                dispatchedAt: new Date(Date.now() - 86400000), // Yesterday
                completedAt: new Date(),
                odometerStart: 15300,
                odometerEnd: 15420,
            },
        });
    }

    // 6. Maintenance Logs
    const shopVehicle = allVehicles.find(v => v.status === VehicleStatus.IN_SHOP);
    if (shopVehicle) {
        await prisma.maintenanceLog.create({
            data: {
                vehicleId: shopVehicle.id,
                serviceType: 'BRAKE_SERVICE',
                description: 'Brake pad replacement and drum cleaning',
                technicianName: 'Sanjay Mechanic',
                cost: 450000, // Rs. 4,500
                scheduledDate: new Date(),
                status: 'PENDING',
            },
        });
    }

    // 7. Expenses
    for (const v of allVehicles) {
        await prisma.expense.create({
            data: {
                vehicleId: v.id,
                type: ExpenseType.FUEL,
                totalCost: 850000, // Rs. 8,500
                liters: 85,
                date: new Date(),
                description: 'Fuel Refill - Indian Oil Petrol Pump',
            },
        });
    }

    console.log('Seeding complete! 🇮🇳');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
