import { z } from 'zod';
import { ExpenseType } from '../../types/enums';

export const createExpenseSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        tripId: z.string().uuid().optional(),
        type: z.nativeEnum(ExpenseType),
        amount: z.number().int().positive(), // totalCost in paise
        description: z.string().optional(),
        date: z.string().datetime(),
        receiptRef: z.string().optional(),
    }),
});

export const createFuelLogSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        tripId: z.string().uuid(),
        liters: z.number().positive(),
        costPerLiter: z.number().int().positive(), // in paise
        odometerAtFill: z.number().int().positive(),
        date: z.string().datetime(),
    }),
});

export const expenseIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>['body'];
export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>['body'];
