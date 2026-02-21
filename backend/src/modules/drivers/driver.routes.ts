import { Router } from 'express';
import { DriverController } from './driver.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createDriverSchema, updateDriverSchema, updateDutyStatusSchema, driverIdParamSchema } from './driver.schema';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/', requireRole(UserRole.MANAGER, UserRole.DISPATCHER, UserRole.SAFETY_OFFICER), DriverController.getAll);
router.get('/available', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), DriverController.getAvailable);

router.post('/', requireRole(UserRole.MANAGER, UserRole.SAFETY_OFFICER), validate(createDriverSchema), DriverController.create);
router.patch('/:id', requireRole(UserRole.MANAGER, UserRole.SAFETY_OFFICER), validate(updateDriverSchema), DriverController.update);
router.patch('/:id/duty-status', requireRole(UserRole.MANAGER, UserRole.SAFETY_OFFICER), validate(updateDutyStatusSchema), DriverController.updateStatus);

export { router as driverRoutes };
