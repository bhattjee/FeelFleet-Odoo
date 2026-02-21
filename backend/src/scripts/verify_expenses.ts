import { ExpenseService } from '../backend/src/modules/expenses/expense.service';
import { prisma } from '../backend/src/config/database';
import { ExpenseType } from '../backend/src/types/enums';

async function verifyExpenses() {
    console.log('--- Verifying Expense Management ---');

    // 1. Get a vehicle and trip
    const vehicle = await prisma.vehicle.findFirst();
    const trip = await prisma.trip.findFirst();

    if (!vehicle) {
        console.log('No vehicle found. Skipping.');
        return;
    }

    // 2. Create general expense
    const expense = await ExpenseService.createExpense({
        vehicleId: vehicle.id,
        tripId: trip?.id,
        type: ExpenseType.TOLL,
        amount: 500,
        description: 'Test Toll',
        date: new Date(),
    });
    console.log(`Expense created: ${expense.type} - ₹${expense.totalCost}`);

    // 3. Create fuel log
    const fuel = await ExpenseService.createFuelLog({
        vehicleId: vehicle.id,
        tripId: trip?.id,
        liters: 50,
        costPerLiter: 100,
        odometerAtFill: 12000,
        date: new Date(),
    });
    console.log(`Fuel log created: ${fuel.liters}L at ₹${fuel.costPerLiter}/L. Total: ₹${fuel.totalCost}`);

    // 4. Check vehicle totals
    const totals = await ExpenseService.getTotalCostByVehicle(vehicle.id);
    console.log(`Totals for vehicle ${vehicle.licensePlate}:`, totals);

    console.log('--- Verification Complete ---');
}

verifyExpenses().catch(console.error);
