import { z } from 'zod';
import { ServiceType } from '../../types/enums';

export const createServiceLogSchema = z.object({
    body: z.object({
        vehicleId: z.string().uuid(),
        serviceType: z.nativeEnum(ServiceType),
        description: z.string().min(5),
        technicianName: z.string().min(2),
        cost: z.number().int().positive(), // in paise/cents
        scheduledDate: z.string().datetime(),
    }),
});

export const completeServiceSchema = z.object({
    body: z.object({
        completedDate: z.string().datetime(),
        finalCost: z.number().int().positive().optional(),
    }),
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const maintenanceIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export type CreateServiceLogInput = z.infer<typeof createServiceLogSchema>['body'];
export type CompleteServiceInput = z.infer<typeof completeServiceSchema>['body'];
