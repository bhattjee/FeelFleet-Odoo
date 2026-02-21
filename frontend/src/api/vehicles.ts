import { api } from './client';

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type VehicleType = 'TRUCK' | 'VAN' | 'BIKE';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  year: number;
  type: VehicleType;
  maxCapacity: number;
  odometer: number;
  status: VehicleStatus;
  isIdle?: boolean;
  acquisitionCost?: number;
  createdAt?: string;
}

export interface CreateVehiclePayload {
  name: string;
  model: string;
  licensePlate: string;
  year: number;
  type: VehicleType;
  maxCapacity: number;
  odometer: number;
  acquisitionCost?: number;
}

export async function getVehicles(params?: { status?: VehicleStatus; type?: VehicleType }): Promise<Vehicle[]> {
  const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  const path = search ? `/api/vehicles?${search}` : '/api/vehicles';
  const res = await api.get<Vehicle[]>(path);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch vehicles');
  return Array.isArray(res.data) ? res.data : [];
}

export async function createVehicle(payload: CreateVehiclePayload): Promise<Vehicle> {
  const res = await api.post<Vehicle>('/api/vehicles', payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create vehicle');
  return res.data;
}

export async function updateVehicle(id: string, payload: Partial<CreateVehiclePayload> & { status?: VehicleStatus }): Promise<Vehicle> {
  const res = await api.patch<Vehicle>(`/api/vehicles/${id}`, payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to update vehicle');
  return res.data;
}

export async function retireVehicle(id: string): Promise<Vehicle> {
  const res = await api.patch<Vehicle>(`/api/vehicles/${id}/retire`);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to retire vehicle');
  return res.data;
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const res = await api.get<Vehicle[]>('/api/vehicles/available');
  if (!res.success || res.data == null) throw new Error(res.error || 'Failed to fetch available vehicles');
  return Array.isArray(res.data) ? res.data : [];
}
