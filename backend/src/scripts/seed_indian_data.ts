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

    // 3. Create Vehicles (4 AVAILABLE + 1 IN_SHOP so dashboard KPIs and trips can populate)
    await prisma.vehicle.createMany({
        data: [
            { name: 'Tata Ultra EX', model: 'Ultra 1918.T', licensePlate: 'MH-12-PQ-4567', year: 2023, type: VehicleType.TRUCK, maxCapacity: 10000, odometer: 15420, status: VehicleStatus.AVAILABLE, region: 'Pune', acquisitionCost: 285000000 },
            { name: 'Mahindra Bolero Pick-up', model: 'Bolero City', licensePlate: 'DL-01-AB-8901', year: 2022, type: VehicleType.VAN, maxCapacity: 1500, odometer: 42300, status: VehicleStatus.AVAILABLE, region: 'Delhi', acquisitionCost: 95000000 },
            { name: 'Tata Ace Gold', model: 'Ace CNG', licensePlate: 'KA-05-MN-2345', year: 2024, type: VehicleType.VAN, maxCapacity: 750, odometer: 1200, status: VehicleStatus.AVAILABLE, region: 'Bangalore', acquisitionCost: 55000000 },
            { name: 'Ashok Leyland Dost', model: 'Dost Strong', licensePlate: 'TN-07-XY-6789', year: 2021, type: VehicleType.VAN, maxCapacity: 1250, odometer: 65000, status: VehicleStatus.IN_SHOP, region: 'Chennai', acquisitionCost: 78000000 },
            { name: 'Hero Splendor', model: 'Splendor Plus', licensePlate: 'HR-26-ZZ-9999', year: 2023, type: VehicleType.BIKE, maxCapacity: 50, odometer: 8500, status: VehicleStatus.AVAILABLE, region: 'Gurgaon', acquisitionCost: 8500000 },
        ],
    });

    const allVehicles = await prisma.vehicle.findMany();
    const [v1, v2, v3, v4, vInShop] = allVehicles;

    // 4. Create Drivers (4 ON_DUTY so we can assign to DISPATCHED, DRAFT, COMPLETED)
    await prisma.driver.createMany({
        data: [
            { name: 'Amit Kumar', employeeId: 'EMP-001', licenseNumber: 'DL-1234567890', licenseExpiry: new Date('2028-12-31'), authorizedTypes: [VehicleType.TRUCK, VehicleType.VAN], dutyStatus: DriverStatus.ON_DUTY, phone: '9876543210' },
            { name: 'Suresh Patil', employeeId: 'EMP-002', licenseNumber: 'MH-0987654321', licenseExpiry: new Date('2025-06-15'), authorizedTypes: [VehicleType.VAN], dutyStatus: DriverStatus.ON_DUTY, phone: '9123456789' },
            { name: 'Rahul Verma', employeeId: 'EMP-003', licenseNumber: 'KA-1122334455', licenseExpiry: new Date('2026-03-20'), authorizedTypes: [VehicleType.VAN, VehicleType.BIKE], dutyStatus: DriverStatus.ON_DUTY, phone: '9988776655' },
            { name: 'Priya Nair', employeeId: 'EMP-004', licenseNumber: 'KL-9988776655', licenseExpiry: new Date('2027-01-10'), authorizedTypes: [VehicleType.VAN, VehicleType.BIKE], dutyStatus: DriverStatus.ON_DUTY, phone: '8877665544' },
        ],
    });

    const allDrivers = await prisma.driver.findMany();
    const [d1, d2, d3, d4] = allDrivers;

    // 5. Create Trips to populate dashboard: 2 DISPATCHED (Active Fleet), 2 COMPLETED, 2 DRAFT (Pending Cargo)
    // 5a. Two DISPATCHED trips -> then set those vehicles ON_TRIP and drivers OFF_DUTY
    await prisma.trip.createMany({
        data: [
            { vehicleId: v1.id, driverId: d1.id, origin: 'Pune Warehouse', destination: 'Mumbai Hub', cargoWeight: 5000, status: TripStatus.DISPATCHED, revenue: 250000, dispatchedAt: new Date(), odometerStart: 15400 },
            { vehicleId: v2.id, driverId: d2.id, origin: 'Indira Nagar, Bangalore', destination: 'Whitefield, Bangalore', cargoWeight: 1200, status: TripStatus.DISPATCHED, revenue: 450000, dispatchedAt: new Date(), odometerStart: 42280 },
        ],
    });
    await prisma.vehicle.updateMany({ where: { id: { in: [v1.id, v2.id] } }, data: { status: VehicleStatus.ON_TRIP } });
    await prisma.driver.updateMany({ where: { id: { in: [d1.id, d2.id] } }, data: { dutyStatus: DriverStatus.OFF_DUTY } });

    // 5b. Two COMPLETED trips (historical – vehicles stay AVAILABLE)
    await prisma.trip.createMany({
        data: [
            { vehicleId: v3.id, driverId: d1.id, origin: 'Dharavi, Mumbai', destination: 'JNPT Port, Navi Mumbai', cargoWeight: 600, status: TripStatus.COMPLETED, revenue: 1250000, dispatchedAt: new Date(Date.now() - 86400000 * 2), completedAt: new Date(Date.now() - 86400000), odometerStart: 1100, odometerEnd: 1200 },
            { vehicleId: v4.id, driverId: d2.id, origin: 'Gurgaon Sector 18', destination: 'Delhi NCR', cargoWeight: 40, status: TripStatus.COMPLETED, revenue: 35000, dispatchedAt: new Date(Date.now() - 86400000 * 3), completedAt: new Date(Date.now() - 86400000 * 2), odometerStart: 8400, odometerEnd: 8500 },
        ],
    });

    // 5c. Two DRAFT trips (Pending Cargo in dashboard)
    await prisma.trip.createMany({
        data: [
            { vehicleId: v3.id, driverId: d3.id, origin: 'Bangalore Tech Park', destination: 'Electronic City', cargoWeight: 400, status: TripStatus.DRAFT },
            { vehicleId: v4.id, driverId: d4.id, origin: 'Gurgaon', destination: 'Faridabad', cargoWeight: 35, status: TripStatus.DRAFT },
        ],
    });

    // 5d. More COMPLETED trips for a fuller Trip Dispatcher list (varied routes)
    await prisma.trip.createMany({
        data: [
            { vehicleId: v3.id, driverId: d3.id, origin: 'Mumbai BKC', destination: 'Thane', cargoWeight: 500, status: TripStatus.COMPLETED, revenue: 180000, dispatchedAt: new Date(Date.now() - 86400000 * 5), completedAt: new Date(Date.now() - 86400000 * 4), odometerStart: 1150, odometerEnd: 1180 },
            { vehicleId: v4.id, driverId: d4.id, origin: 'Noida Sector 62', destination: 'Ghaziabad', cargoWeight: 45, status: TripStatus.COMPLETED, revenue: 42000, dispatchedAt: new Date(Date.now() - 86400000 * 7), completedAt: new Date(Date.now() - 86400000 * 6), odometerStart: 8520, odometerEnd: 8560 },
            { vehicleId: v3.id, driverId: d1.id, origin: 'Chennai Port', destination: 'Sriperumbudur', cargoWeight: 650, status: TripStatus.COMPLETED, revenue: 95000, dispatchedAt: new Date(Date.now() - 86400000 * 10), completedAt: new Date(Date.now() - 86400000 * 9), odometerStart: 1250, odometerEnd: 1310 },
        ],
    });

    const allTrips = await prisma.trip.findMany({ where: { status: TripStatus.COMPLETED }, include: { vehicle: true, driver: true } });

    // 6. Maintenance Log for IN_SHOP vehicle (dashboard Maintenance Alert)
    await prisma.maintenanceLog.create({
        data: {
            vehicleId: vInShop.id,
            serviceType: 'BRAKE_SERVICE',
            description: 'Brake pad replacement and drum cleaning',
            technicianName: 'Sanjay Mechanic',
            cost: 450000,
            scheduledDate: new Date(),
            status: 'IN_PROGRESS',
        },
    });

    // 7. Expenses – fuel linked to completed trips + standalone fuel/maintenance/other for a full Expense page
    const now = new Date();
    const day = (d: number) => new Date(now.getTime() + d * 86400000);

    for (const trip of allTrips) {
        const fuelCost = Math.round(85000 + Math.random() * 165000); // Rs. 850–2,500 in paise
        await prisma.expense.create({
            data: {
                vehicleId: trip.vehicleId,
                tripId: trip.id,
                type: ExpenseType.FUEL,
                totalCost: fuelCost,
                liters: 25 + Math.round(Math.random() * 40),
                date: day(-Math.floor(Math.random() * 5)),
                odometerAtFill: (trip as any).odometerEnd ?? trip.vehicle.odometer,
            },
        });
    }

    const fuelEntries = [
        { vehicleId: v1.id, totalCost: 850000, liters: 85, desc: 'Fuel Refill - Indian Oil, Pune' },
        { vehicleId: v2.id, totalCost: 620000, liters: 62, desc: 'Diesel - HP Pump, Delhi' },
        { vehicleId: v3.id, totalCost: 410000, liters: 41, desc: 'CNG - Bangalore' },
        { vehicleId: v4.id, totalCost: 380000, liters: 38, desc: 'Petrol - Gurgaon' },
        { vehicleId: vInShop.id, totalCost: 180000, liters: 18, desc: 'Fuel - Chennai' },
        { vehicleId: v1.id, totalCost: 720000, liters: 72, desc: 'Top-up - Mumbai Highway' },
        { vehicleId: v3.id, totalCost: 290000, liters: 29, desc: 'CNG - Electronic City' },
    ];
    for (const e of fuelEntries) {
        await prisma.expense.create({
            data: {
                vehicleId: e.vehicleId,
                type: ExpenseType.FUEL,
                totalCost: e.totalCost,
                liters: e.liters,
                date: day(-Math.floor(Math.random() * 14)),
                description: e.desc,
            },
        });
    }

    const maintenanceEntries = [
        { vehicleId: v1.id, cost: 450000, desc: 'Oil change and filter' },
        { vehicleId: v2.id, cost: 320000, desc: 'Tyre rotation' },
        { vehicleId: v3.id, cost: 180000, desc: 'General service' },
    ];
    for (const e of maintenanceEntries) {
        await prisma.expense.create({
            data: {
                vehicleId: e.vehicleId,
                type: ExpenseType.MAINTENANCE,
                totalCost: e.cost,
                date: day(-Math.floor(Math.random() * 30)),
                description: e.desc,
            },
        });
    }

    await prisma.expense.create({
        data: { vehicleId: v1.id, type: ExpenseType.TOLL, totalCost: 85000, date: day(-2), description: 'Mumbai-Pune Expressway toll' },
    });
    await prisma.expense.create({
        data: { vehicleId: v2.id, type: ExpenseType.INSURANCE, totalCost: 1250000, date: day(-90), description: 'Annual third-party insurance' },
    });

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
