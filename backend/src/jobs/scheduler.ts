import cron from 'node-cron';
import { logger } from '../config/logger';
import { runLicenseExpiryCheck } from './licenseExpiryChecker.job';

export const initScheduler = () => {
    // Every day at 6:00 AM
    cron.schedule('0 6 * * *', async () => {
        try {
            await runLicenseExpiryCheck();
        } catch (err) {
            logger.error(err, 'Error in License Expiry job:');
        }
    });

    logger.info('Background job scheduler initialized.');
};
