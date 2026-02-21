import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/kpis', AnalyticsController.getKPIs);
router.get('/fuel-efficiency', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), AnalyticsController.getFuelEfficiency);
router.get('/costly-vehicles', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), AnalyticsController.getCostlyVehicles);
router.get('/financial-summary', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), AnalyticsController.getFinancialSummary);

export { router as analyticsRoutes };
