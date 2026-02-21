# FleetFlow API Reference

## Authentication
- `POST /api/auth/login`: Authenticate and get JWT cookie.
- `POST /api/auth/logout`: Clear JWT cookie.
- `GET /api/auth/me`: Get current user profile.

## Vehicles
- `GET /api/vehicles`: List all vehicles (Auth required).
- `GET /api/vehicles/available`: List available vehicles (Manager/Dispatcher).
- `POST /api/vehicles`: Create new vehicle (Manager).
- `PATCH /api/vehicles/:id`: Update vehicle (Manager).
- `PATCH /api/vehicles/:id/retire`: Retire vehicle (Manager).

## Drivers
- `GET /api/drivers`: List all drivers (Auth required).
- `GET /api/drivers/available`: List compliant drivers for dispatch.
- `POST /api/drivers`: Add driver (Manager/Safety Officer).
- `PATCH /api/drivers/:id/duty-status`: Update duty status (Manager/Safety Officer).

## Trips
- `GET /api/trips`: List all trips.
- `POST /api/trips`: Create/Dispatch a trip (Manager/Dispatcher).
- `PATCH /api/trips/:id/status`: Update trip status (COMPLETED/CANCELLED).

## Analytics
- `GET /api/analytics/kpis`: Holistic fleet KPIs.
- `GET /api/analytics/fuel-efficiency`: Monthly fuel efficiency stats.
- `GET /api/analytics/cost-breakdown`: Operational cost aggregation.
