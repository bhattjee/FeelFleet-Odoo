import { eventEmitter } from './eventEmitter';
import { logger } from '../config/logger';

export const initVehicleEvents = () => {
    eventEmitter.on('vehicle.inShop', ({ plate }) => {
        logger.info(`Vehicle ${plate} moved to IN_SHOP for maintenance.`);
    });

    eventEmitter.on('vehicle.available', ({ plate }) => {
        logger.info(`Vehicle ${plate} is now AVAILABLE for dispatch.`);
    });
};
