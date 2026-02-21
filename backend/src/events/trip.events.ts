import { eventEmitter } from './eventEmitter';
import { logger } from '../config/logger';

export const initTripEvents = () => {
    eventEmitter.on('trip.dispatched', ({ tripId, vehicleId }) => {
        logger.info(`Trip ${tripId} dispatched with vehicle ${vehicleId}.`);
    });

    eventEmitter.on('trip.completed', ({ tripId, vehicleId, odometerEnd }) => {
        logger.info(`Trip ${tripId} completed. Vehicle ${vehicleId} odometer updated to ${odometerEnd}.`);
        // Recalculate metrics could be triggered here
    });
};
