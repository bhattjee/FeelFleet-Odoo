import { EventEmitter } from 'events';

export type FleetFlowEvents = {
    'vehicle.inShop': { vehicleId: string; plate: string };
    'vehicle.available': { vehicleId: string; plate: string };
    'trip.dispatched': { tripId: string; vehicleId: string; driverId: string };
    'trip.completed': { tripId: string; vehicleId: string; driverId: string; odometerEnd: number };
    'driver.licenseExpired': { driverId: string; name: string };
};

class TypedEventEmitter extends EventEmitter {
    emit<K extends keyof FleetFlowEvents>(event: K, payload: FleetFlowEvents[K]): boolean {
        return super.emit(event, payload);
    }

    on<K extends keyof FleetFlowEvents>(event: K, listener: (payload: FleetFlowEvents[K]) => void): this {
        return super.on(event, listener);
    }
}

export const eventEmitter = new TypedEventEmitter();
export default eventEmitter;
