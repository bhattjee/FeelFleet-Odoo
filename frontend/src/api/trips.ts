import { api } from './client';

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeight: number;
  estimatedFuelCost?: number;
  status: TripStatus;
  odometerStart?: number;
  odometerEnd?: number;
  revenue?: number;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  vehicle?: { id: string; name: string; licensePlate: string };
  driver?: { id: string; name: string };
}

export async function getTrips(params?: { status?: TripStatus }): Promise<Trip[]> {
  const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  const path = search ? `/api/trips?${search}` : '/api/trips';
  const res = await api.get<Trip[]>(path);
  if (!res.success || res.data == null) throw new Error(res.error || 'Failed to fetch trips');
  return Array.isArray(res.data) ? res.data : [];
}

export interface CreateTripPayload {
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  origin: string;
  destination: string;
  estimatedFuelCost?: number;
  status?: TripStatus;
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const res = await api.post<Trip>('/api/trips', payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create trip');
  return res.data;
}

export async function updateTripStatus(
  tripId: string,
  payload: { status: TripStatus; odometerEnd?: number }
): Promise<Trip> {
  const res = await api.patch<Trip>(`/api/trips/${tripId}/status`, payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to update trip status');
  return res.data;
}
