import { Router } from 'express';
import { TripController } from './trip.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createTripSchema, updateTripStatusSchema } from './trip.schema';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), TripController.getAll);

router.post('/', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), validate(createTripSchema), TripController.create);
router.patch('/:id/status', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), validate(updateTripStatusSchema), TripController.updateStatus);

export { router as tripRoutes };
