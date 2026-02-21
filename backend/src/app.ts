import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './config/cors';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './config/logger';

// Route Imports
import { authRoutes } from './modules/auth/auth.routes';
import { vehicleRoutes } from './modules/vehicles/vehicle.routes';
import { driverRoutes } from './modules/drivers/driver.routes';
import { tripRoutes } from './modules/trips/trip.routes';
import { maintenanceRoutes } from './modules/maintenance/maintenance.routes';
import { expenseRoutes } from './modules/expenses/expense.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

const app = express();

// Global Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(apiLimiter);

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(errorHandler);

export default app;
