import { prisma } from '../src/config/database';
import bcrypt from 'bcrypt';
import { UserRole, VehicleType, VehicleStatus, DriverStatus, TripStatus } from '../src/types/enums';

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Clear existing data (reverse dependency order)
    console.log('🧹 Clearing existing data...');
    await prisma.expense.deleteMany();
    await prisma.maintenanceLog.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // 2. Seed Users
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    await prisma.user.createMany({
        data: [
            { email: 'manager@fleetflow.com', name: 'Admin Manager', password: hashedPassword, role: UserRole.MANAGER },
            { email: 'dispatcher@fleetflow.com', name: 'John Dispatcher', password: hashedPassword, role: UserRole.DISPATCHER },
            { email: 'safety@fleetflow.com', name: 'Sarah Safety', password: hashedPassword, role: UserRole.SAFETY_OFFICER },
        ],
    });

    // 3. Seed Vehicles
    console.log('🚛 Seeding vehicles...');
    await prisma.vehicle.createMany({
        data: [
            { name: 'Truck-01', model: 'Volvo FH16', licensePlate: 'MH-12-FF-1234', year: 2022, type: VehicleType.TRUCK, maxCapacity: 20000, odometer: 45000, status: VehicleStatus.AVAILABLE },
            { name: 'Truck-02', model: 'SCANIA R450', licensePlate: 'MH-12-FF-5678', year: 2021, type: VehicleType.TRUCK, maxCapacity: 18000, odometer: 62000, status: VehicleStatus.ON_TRIP },
            { name: 'Van-01', model: 'Mercedes Sprinter', licensePlate: 'MH-12-FF-9012', year: 2023, type: VehicleType.VAN, maxCapacity: 1500, odometer: 12000, status: VehicleStatus.AVAILABLE },
            { name: 'Van-02', model: 'Ford Transit', licensePlate: 'MH-12-FF-3456', year: 2020, type: VehicleType.VAN, maxCapacity: 1200, odometer: 85000, status: VehicleStatus.IN_SHOP },
            { name: 'Bike-01', model: 'Hero Electric', licensePlate: 'MH-12-FF-7890', year: 2024, type: VehicleType.BIKE, maxCapacity: 50, odometer: 500, status: VehicleStatus.AVAILABLE },
        ],
    });

    // 4. Seed Drivers
    console.log('👨‍✈️ Seeding drivers...');
    const v1 = await prisma.vehicle.findFirst({ where: { name: 'Truck-01' } });
    const v2 = await prisma.vehicle.findFirst({ where: { name: 'Truck-02' } });

    await prisma.driver.createMany({
        data: [
            { name: 'Rajesh Kumar', employeeId: 'FF-D01', licenseNumber: 'DL-123456789', licenseExpiry: new Date('2026-12-31'), authorizedTypes: [VehicleType.TRUCK, VehicleType.VAN], dutyStatus: DriverStatus.ON_DUTY },
            { name: 'Amit Singh', employeeId: 'FF-D02', licenseNumber: 'DL-987654321', licenseExpiry: new Date('2025-06-15'), authorizedTypes: [VehicleType.TRUCK], dutyStatus: DriverStatus.OFF_DUTY },
            { name: 'Suresh Patel', employeeId: 'FF-D03', licenseNumber: 'DL-456789123', licenseExpiry: new Date('2024-03-01'), authorizedTypes: [VehicleType.VAN, VehicleType.BIKE], dutyStatus: DriverStatus.ON_DUTY },
        ],
    });

    console.log('✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
