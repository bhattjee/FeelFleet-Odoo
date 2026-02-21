import { z } from 'zod';
import { VehicleType, VehicleStatus } from '../../types/enums';

export const createVehicleSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        model: z.string().min(2),
        licensePlate: z.string().min(2),
        year: z.number().int().min(1990).max(new Date().getFullYear()),
        type: z.nativeEnum(VehicleType),
        maxCapacity: z.number().positive(),
        odometer: z.number().nonnegative(),
        acquisitionCost: z.number().positive().optional(),
        status: z.nativeEnum(VehicleStatus).optional(),
    }),
});

export const updateVehicleSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        model: z.string().min(2).optional(),
        licensePlate: z.string().min(2).optional(),
        year: z.number().int().min(1990).max(new Date().getFullYear()).optional(),
        type: z.nativeEnum(VehicleType).optional(),
        maxCapacity: z.number().positive().optional(),
        odometer: z.number().nonnegative().optional(),
        acquisitionCost: z.number().positive().optional(),
        status: z.nativeEnum(VehicleStatus).optional(),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const retireVehicleSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const vehicleIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
