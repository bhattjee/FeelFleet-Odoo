import { z } from 'zod';
import { VehicleType, DriverStatus } from '../../types/enums';

export const createDriverSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        employeeId: z.string().min(2),
        licenseNumber: z.string().min(2),
        licenseExpiry: z.string().datetime(),
        authorizedTypes: z.array(z.nativeEnum(VehicleType)),
        phone: z.string().optional(),
    }),
});

export const updateDriverSchema = z.object({
    body: createDriverSchema.shape.body.partial(),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const updateDutyStatusSchema = z.object({
    body: z.object({
        dutyStatus: z.nativeEnum(DriverStatus),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const driverIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>['body'];
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>['body'];
