import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from './maintenance.service';
import { successResponse } from '../../utils/apiResponse';

export class MaintenanceController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                vehicleId: req.query.vehicleId as string,
                status: req.query.status as string,
            };
            const logs = await MaintenanceService.getAllServiceLogs(filters);
            return res.json(successResponse(logs));
        } catch (err) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const log = await MaintenanceService.createServiceLog(req.validated!.body);
            return res.status(201).json(successResponse(log));
        } catch (err) {
            next(err);
        }
    }

    static async complete(req: Request, res: Response, next: NextFunction) {
        try {
            const log = await MaintenanceService.completeService(req.params.id, req.validated!.body);
            return res.json(successResponse(log));
        } catch (err) {
            next(err);
        }
    }
}
