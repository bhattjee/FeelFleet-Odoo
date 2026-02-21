import { api } from './client';

export type ServiceType =
  | 'OIL_CHANGE'
  | 'TIRE_REPLACEMENT'
  | 'BRAKE_SERVICE'
  | 'ENGINE_REPAIR'
  | 'INSPECTION'
  | 'OTHER';

export interface MaintenanceLogVehicle {
  id: string;
  name: string;
  licensePlate: string;
  status: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: ServiceType;
  description: string;
  technicianName: string;
  cost: number;
  scheduledDate: string;
  completedDate: string | null;
  status: string;
  createdAt: string;
  vehicle?: MaintenanceLogVehicle;
}

export interface CreateServiceLogPayload {
  vehicleId: string;
  serviceType: ServiceType;
  description: string;
  technicianName: string;
  cost: number;
  scheduledDate: string;
}

export interface CompleteServicePayload {
  completedDate: string;
  finalCost?: number;
}

export async function getMaintenanceLogs(params?: {
  vehicleId?: string;
  status?: string;
}): Promise<MaintenanceLog[]> {
  const search = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  const path = search ? `/api/maintenance?${search}` : '/api/maintenance';
  const res = await api.get<MaintenanceLog[]>(path);
  if (!res.success || res.data == null) throw new Error(res.error || 'Failed to fetch maintenance logs');
  return Array.isArray(res.data) ? res.data : [];
}

export async function createServiceLog(payload: CreateServiceLogPayload): Promise<MaintenanceLog> {
  const res = await api.post<MaintenanceLog>('/api/maintenance', payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create service log');
  return res.data;
}

export async function completeService(logId: string, payload: CompleteServicePayload): Promise<MaintenanceLog> {
  const res = await api.patch<MaintenanceLog>(`/api/maintenance/${logId}/complete`, payload);
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to complete service');
  return res.data;
}
