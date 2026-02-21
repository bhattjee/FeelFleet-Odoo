import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';
import { successResponse } from '../../utils/apiResponse';
import { VehicleStatus } from '../../types/enums';

export class VehicleController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                status: req.query.status as VehicleStatus,
                type: req.query.type as any,
            };
            const vehicles = await VehicleService.getAllVehicles(filters);
            return res.json(successResponse(vehicles));
        } catch (err) {
            next(err);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicle = await VehicleService.getVehicleById(req.params.id);
            return res.json(successResponse(vehicle));
        } catch (err) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicle = await VehicleService.createVehicle(req.validated!.body);
            return res.status(201).json(successResponse(vehicle));
        } catch (err) {
            next(err);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicle = await VehicleService.updateVehicle(req.params.id, req.validated!.body);
            return res.json(successResponse(vehicle));
        } catch (err) {
            next(err);
        }
    }

    static async retire(req: Request, res: Response, next: NextFunction) {
        try {
            const vehicle = await VehicleService.retireVehicle(req.params.id);
            return res.json(successResponse(vehicle));
        } catch (err) {
            next(err);
        }
    }

    static async getAvailable(_req: Request, res: Response, next: NextFunction) {
        try {
            const vehicles = await VehicleService.getAvailableVehicles();
            return res.json(successResponse(vehicles));
        } catch (err) {
            next(err);
        }
    }
}
