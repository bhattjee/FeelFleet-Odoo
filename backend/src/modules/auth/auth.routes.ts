import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { loginSchema, registerSchema } from './auth.schema';
import { auth } from '../../middleware/auth.middleware';
import { loginLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.get('/me', auth, AuthController.getMe);

export { router as authRoutes };
