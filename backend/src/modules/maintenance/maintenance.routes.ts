import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createServiceLogSchema, completeServiceSchema, maintenanceIdParamSchema } from './maintenance.schema';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/', requireRole(UserRole.MANAGER, UserRole.SAFETY_OFFICER), MaintenanceController.getAll);

router.post('/', requireRole(UserRole.MANAGER, UserRole.SAFETY_OFFICER), validate(createServiceLogSchema), MaintenanceController.create);
router.patch('/:id/complete', requireRole(UserRole.MANAGER), validate(completeServiceSchema), MaintenanceController.complete);

export { router as maintenanceRoutes };
