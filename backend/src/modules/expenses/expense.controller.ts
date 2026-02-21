import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service';
import { successResponse } from '../../utils/apiResponse';
import { ExpenseType } from '../../types/enums';

export class ExpenseController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                vehicleId: req.query.vehicleId as string,
                type: req.query.type as ExpenseType,
            };
            const expenses = await ExpenseService.getAllExpenses(filters);
            return res.json(successResponse(expenses));
        } catch (err) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const expense = await ExpenseService.createExpense(req.validated!.body);
            return res.status(201).json(successResponse(expense));
        } catch (err) {
            next(err);
        }
    }

    static async createFuel(req: Request, res: Response, next: NextFunction) {
        try {
            const fuelLog = await ExpenseService.createFuelLog(req.validated!.body);
            return res.status(201).json(successResponse(fuelLog));
        } catch (err) {
            next(err);
        }
    }

    static async getVehicleTotal(req: Request, res: Response, next: NextFunction) {
        try {
            const totals = await ExpenseService.getTotalCostByVehicle(req.params.vehicleId);
            return res.json(successResponse(totals));
        } catch (err) {
            next(err);
        }
    }
}
