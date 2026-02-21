import { z } from 'zod';
import { TripStatus } from '../../types/enums';

export const createTripSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        driverId: z.string().uuid(),
        cargoWeight: z.number().positive(),
        origin: z.string().min(2),
        destination: z.string().min(2),
        estimatedFuelCost: z.number().positive().optional(),
        status: z.nativeEnum(TripStatus).optional(),
    }),
});

export const updateTripStatusSchema = z.object({
    body: z.object({
        status: z.nativeEnum(TripStatus),
        odometerEnd: z.number().positive().optional(),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const tripIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateTripInput = z.infer<typeof createTripSchema>['body'];
export type UpdateTripStatusInput = z.infer<typeof updateTripStatusSchema>['body'];
