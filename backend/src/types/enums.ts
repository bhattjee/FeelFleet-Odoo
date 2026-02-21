export enum UserRole {
    MANAGER = 'MANAGER',
    DISPATCHER = 'DISPATCHER',
    SAFETY_OFFICER = 'SAFETY_OFFICER',
    FINANCIAL_ANALYST = 'FINANCIAL_ANALYST',
}

export enum VehicleType {
    TRUCK = 'TRUCK',
    VAN = 'VAN',
    BIKE = 'BIKE',
}

export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE',
    ON_TRIP = 'ON_TRIP',
    IN_SHOP = 'IN_SHOP',
    RETIRED = 'RETIRED',
}

export enum TripStatus {
    DRAFT = 'DRAFT',
    DISPATCHED = 'DISPATCHED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum DriverStatus {
    ON_DUTY = 'ON_DUTY',
    OFF_DUTY = 'OFF_DUTY',
    SUSPENDED = 'SUSPENDED',
}

export enum ServiceType {
    OIL_CHANGE = 'OIL_CHANGE',
    TIRE_REPLACEMENT = 'TIRE_REPLACEMENT',
    BRAKE_SERVICE = 'BRAKE_SERVICE',
    ENGINE_REPAIR = 'ENGINE_REPAIR',
    INSPECTION = 'INSPECTION',
    OTHER = 'OTHER',
}

export enum ExpenseType {
    FUEL = 'FUEL',
    MAINTENANCE = 'MAINTENANCE',
    TOLL = 'TOLL',
    INSURANCE = 'INSURANCE',
    OTHER = 'OTHER',
}
