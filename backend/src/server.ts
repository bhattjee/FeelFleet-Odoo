import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { initScheduler } from './jobs/scheduler';
import { initVehicleEvents } from './events/vehicle.events';
import { initTripEvents } from './events/trip.events';
import { prisma } from './config/database';

const PORT = env.PORT;

// Initialize Events
initVehicleEvents();
initTripEvents();

// Initialize Background Jobs
initScheduler();

const server = app.listen(PORT, () => {
  logger.info(`🚀 FleetFlow API running on port ${PORT} — Environment: ${env.NODE_ENV}`);
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
