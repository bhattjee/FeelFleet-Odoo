import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { auth } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVehicleSchema, updateVehicleSchema, vehicleIdParamSchema } from './vehicle.schema';
import { UserRole } from '../../types/enums';

const router = Router();

router.use(auth);

router.get('/', VehicleController.getAll);
router.get('/available', requireRole(UserRole.MANAGER, UserRole.DISPATCHER), VehicleController.getAvailable);
router.get('/:id', validate(vehicleIdParamSchema), VehicleController.getById);

router.post('/', requireRole(UserRole.MANAGER), validate(createVehicleSchema), VehicleController.create);
router.patch('/:id', requireRole(UserRole.MANAGER), validate(updateVehicleSchema), VehicleController.update);
router.patch('/:id/retire', requireRole(UserRole.MANAGER), validate(vehicleIdParamSchema), VehicleController.retire);

export { router as vehicleRoutes };
