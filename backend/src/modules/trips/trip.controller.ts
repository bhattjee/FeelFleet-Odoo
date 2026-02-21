import { Request, Response, NextFunction } from 'express';
import { TripService } from './trip.service';
import { successResponse } from '../../utils/apiResponse';
import { TripStatus } from '../../types/enums';
import { AppError } from '../../middleware/errorHandler.middleware';

export class TripController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                status: req.query.status as TripStatus,
            };
            const trips = await TripService.getAllTrips(filters);
            return res.json(successResponse(trips));
        } catch (err) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const trip = await TripService.createTrip(req.validated!.body);
            return res.status(201).json(successResponse(trip));
        } catch (err) {
            next(err);
        }
    }

    static async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, odometerEnd } = req.validated!.body;

            if (status === TripStatus.COMPLETED) {
                if (odometerEnd === undefined) {
                    throw new AppError(400, 'odometerEnd is required for completing a trip', 'MISSING_DATA');
                }
                const trip = await TripService.completeTrip(id, odometerEnd);
                return res.json(successResponse(trip));
            }

            if (status === TripStatus.CANCELLED) {
                const trip = await TripService.cancelTrip(id);
                return res.json(successResponse(trip));
            }

            throw new AppError(400, 'Invalid status transition requested', 'INVALID_TRANSITION');
        } catch (err) {
            next(err);
        }
    }
}
