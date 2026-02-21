import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { successResponse } from '../../utils/apiResponse';

export class AnalyticsController {
    static async getKPIs(req: Request, res: Response, next: NextFunction) {
        try {
            const { region, type, status } = req.query;
            const kpis = await AnalyticsService.getDashboardKPIs({
                region: region as string,
                type: type as any,
                status: status as any,
            });
            return res.json(successResponse(kpis));
        } catch (err) {
            next(err);
        }
    }

    static async getFuelEfficiency(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await AnalyticsService.getFuelEfficiencyTrend();
            return res.json(successResponse(data));
        } catch (err) {
            next(err);
        }
    }

    static async getCostlyVehicles(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await AnalyticsService.getTopCostlyVehicles();
            return res.json(successResponse(data));
        } catch (err) {
            next(err);
        }
    }

    static async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await AnalyticsService.getFinancialSummary();
            return res.json(successResponse(data));
        } catch (err) {
            next(err);
        }
    }
}
