import { Request, Response, NextFunction } from 'express';
import { DriverService } from './driver.service';
import { successResponse } from '../../utils/apiResponse';
import { DriverStatus } from '../../types/enums';

export class DriverController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                dutyStatus: req.query.dutyStatus as DriverStatus,
            };
            const drivers = await DriverService.getAllDrivers(filters);
            return res.json(successResponse(drivers));
        } catch (err) {
            next(err);
        }
    }

    static async getAvailable(_req: Request, res: Response, next: NextFunction) {
        try {
            const drivers = await DriverService.getAvailableDrivers();
            return res.json(successResponse(drivers));
        } catch (err) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const driver = await DriverService.createDriver(req.validated!.body);
            return res.status(201).json(successResponse(driver));
        } catch (err) {
            next(err);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const driver = await DriverService.updateDriver(req.params.id, req.validated!.body);
            return res.json(successResponse(driver));
        } catch (err) {
            next(err);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const driver = await DriverService.updateDutyStatus(req.params.id, req.validated!.body.dutyStatus);
            return res.json(successResponse(driver));
        } catch (err) {
            next(err);
        }
    }
}
