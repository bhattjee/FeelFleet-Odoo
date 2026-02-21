import { api } from './client';

export interface Driver {
  id: string;
  name: string;
  employeeId: string;
  licenseNumber: string;
  licenseExpiry: string;
  dutyStatus: string;
  safetyScore?: number;
  completedTrips?: number;
  completionRate?: number;
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  const res = await api.get<Driver[]>('/api/drivers/available');
  if (!res.success || res.data == null) throw new Error(res.error || 'Failed to fetch available drivers');
  return Array.isArray(res.data) ? res.data : [];
}
