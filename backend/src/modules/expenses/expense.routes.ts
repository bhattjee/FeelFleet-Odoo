import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createExpenseSchema, createFuelLogSchema } from './expense.schema';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), ExpenseController.getAll);
router.get('/vehicle/:vehicleId/total', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), ExpenseController.getVehicleTotal);

router.post('/', requireRole(UserRole.MANAGER, UserRole.FINANCIAL_ANALYST), validate(createExpenseSchema), ExpenseController.create);
router.post('/fuel', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), validate(createFuelLogSchema), ExpenseController.createFuel);

export { router as expenseRoutes };
