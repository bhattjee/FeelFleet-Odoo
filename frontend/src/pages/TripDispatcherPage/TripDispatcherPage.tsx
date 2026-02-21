import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import { Select } from '../../components/ui/Select/Select';
import { Alert } from '../../components/ui/Alert/Alert';
import { ChevronIcon } from '../../assets/icons';
import { getTrips, createTrip, updateTripStatus } from '../../api/trips';
import { getAvailableVehicles } from '../../api/vehicles';
import { getAvailableDrivers } from '../../api/drivers';
import styles from './TripDispatcherPage.module.css';

interface Trip {
  id: string;
  tripFleetType: string;
  origin: string;
  destination: string;
  status: 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
  vehiclePlate?: string;
  driverName?: string;
  cargoWeight?: number;
  dispatchedAt?: string;
  [key: string]: unknown;
}

/** State types for fetching */
interface Option {
  value: string;
  label: string;
  maxCapacity?: number;
}

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'status', label: 'Status' },
  { value: 'fleetType', label: 'Trip Fleet Type' },
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'DISPATCHED', label: 'Dispatched / On way' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'origin_asc', label: 'Origin (A–Z)', key: 'origin', dir: 'asc' as const },
  { value: 'origin_desc', label: 'Origin (Z–A)', key: 'origin', dir: 'desc' as const },
  { value: 'destination_asc', label: 'Destination (A–Z)', key: 'destination', dir: 'asc' as const },
  { value: 'destination_desc', label: 'Destination (Z–A)', key: 'destination', dir: 'desc' as const },
  { value: 'status_asc', label: 'Status (A–Z)', key: 'status', dir: 'asc' as const },
  { value: 'status_desc', label: 'Status (Z–A)', key: 'status', dir: 'desc' as const },
];

function getStatusLabel(status: string): string {
  if (status === 'DISPATCHED') return 'On way';
  if (status === 'DRAFT') return 'Draft';
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'CANCELLED') return 'Cancelled';
  return status;
}

const defaultFormState = {
  vehicleId: '',
  cargoWeight: '',
  driverId: '',
  originAddress: '',
  destination: '',
  estimatedFuelCost: '',
};

export const TripDispatcherPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Option[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Option[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('origin_asc');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        getTrips().catch(() => []),
        getAvailableVehicles().catch(() => []),
        getAvailableDrivers().catch(() => []),
      ]);
      setTrips(
        tripsData.map((t: { id: string; origin: string; destination: string; status: string; vehicle?: { type?: string; name?: string; licensePlate?: string }; driver?: { name?: string }; cargoWeight?: number; dispatchedAt?: string }) => ({
          id: t.id,
          tripFleetType: t.vehicle?.type ?? t.vehicle?.name ?? '—',
          origin: t.origin,
          destination: t.destination,
          status: t.status as Trip['status'],
          vehiclePlate: t.vehicle?.licensePlate,
          driverName: t.driver?.name,
          cargoWeight: t.cargoWeight,
          dispatchedAt: t.dispatchedAt,
        }))
      );
      setAvailableVehicles(
        vehiclesData.map((v: { id: string; name: string; licensePlate: string; maxCapacity: number }) => ({
          value: v.id,
          label: `${v.name || v.licensePlate} (${v.licensePlate})`,
          maxCapacity: v.maxCapacity,
        }))
      );
      setAvailableDrivers(
        driversData.map((d: { id: string; name: string }) => ({ value: d.id, label: d.name }))
      );
    } catch (err) {
      console.error('Failed to fetch dispatcher data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedVehicle = availableVehicles.find((v) => v.value === formData.vehicleId);
  const cargoNum = formData.cargoWeight ? Number(formData.cargoWeight) : NaN;
  const isCargoOverload = selectedVehicle && !Number.isNaN(cargoNum) && cargoNum > (selectedVehicle.maxCapacity || Infinity);
  const cargoError = isCargoOverload ? 'Too heavy! Cargo exceeds vehicle capacity.' : undefined;

  const filteredTrips = useMemo(() => {
    let list = trips.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        t.tripFleetType.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const sortOpt = SORT_OPTIONS.find((o) => o.value === sortValue);
    if (sortOpt) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortOpt.key as keyof Trip];
        const bVal = b[sortOpt.key as keyof Trip];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          return sortOpt.dir === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    if (groupBy === 'status') {
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    } else if (groupBy === 'fleetType') {
      list = [...list].sort((a, b) => a.tripFleetType.localeCompare(b.tripFleetType));
    }

    return list;
  }, [trips, searchQuery, filterStatus, sortValue, groupBy]);

  const columns: TableColumn<Trip & { no: number }>[] = [
    { key: 'no', label: 'No', width: 48, render: (val) => val as number },
    { key: 'tripFleetType', label: 'Trip Fleet Type' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const status = val as string;
        let variant: 'draft' | 'dispatched' | 'completed' | 'cancelled' = 'draft';
        if (status === 'DISPATCHED') variant = 'dispatched';
        if (status === 'COMPLETED') variant = 'completed';
        if (status === 'CANCELLED') variant = 'cancelled';
        return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 150,
      render: (_, row) => {
        const trip = row as Trip;
        return (
          <div className={styles.actionCell}>
            {trip.status === 'DRAFT' && (
              <button
                className={styles.inlineActionBtn}
                onClick={() => handleTripAction(trip.id, 'DISPATCHED')}
              >
                Dispatch
              </button>
            )}
            {trip.status === 'DISPATCHED' && (
              <button
                className={styles.inlineActionBtn}
                onClick={() => {
                  const end = prompt('Enter end odometer:');
                  if (end) handleTripAction(trip.id, 'COMPLETED', Number(end));
                }}
              >
                Complete
              </button>
            )}
            {(trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && (
              <button
                className={`${styles.inlineActionBtn} ${styles.cancelAction}`}
                onClick={() => {
                  if (confirm('Cancel this trip?')) handleTripAction(trip.id, 'CANCELLED');
                }}
              >
                Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const tableData = useMemo(
    () => filteredTrips.map((t, i) => ({ ...t, no: i + 1 })),
    [filteredTrips]
  );

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleTripAction = async (tripId: string, status: string, odometerEnd?: number) => {
    try {
      await updateTripStatus(tripId, {
        status: status as 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED',
        odometerEnd,
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update trip status:', err);
    }
  };

  const handleCreateTrip = async (status: 'DRAFT' | 'DISPATCHED') => {
    if (isCargoOverload) return;

    const err: Record<string, string> = {};
    if (!formData.vehicleId) err.vehicleId = 'Select a vehicle';
    if (!formData.cargoWeight) err.cargoWeight = 'Cargo weight is required';
    if (!formData.driverId) err.driverId = 'Select a driver';
    if (!formData.originAddress) err.originAddress = 'Origin address is required';
    if (!formData.destination) err.destination = 'Destination is required';

    if (Object.keys(err).length > 0) {
      setFormErrors(err);
      return;
    }

    try {
      await createTrip({
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        cargoWeight: Number(formData.cargoWeight),
        origin: formData.originAddress,
        destination: formData.destination,
        estimatedFuelCost: formData.estimatedFuelCost ? Number(formData.estimatedFuelCost) : undefined,
        status,
      });
      fetchData();
      setFormData(defaultFormState);
      setFormErrors({});
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create trip:', err);
    }
  };

  return (
    <AppLayout
      pageTitle="Trip Dispatcher and Management"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Top: Search + Group by, Filter, Sort by */}
        <section className={styles.controlBar}>
          <input
            type="text"
            placeholder="Search bar ..."
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className={styles.toolButtons} ref={dropdownRef}>
            <div className={styles.toolBtnWrapper}>
              <button
                type="button"
                className={`${styles.toolBtn} ${openDropdown === 'group' ? styles.toolBtnActive : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
              >
                Group by
                <ChevronIcon size={14} direction={openDropdown === 'group' ? 'up' : 'down'} />
              </button>
              {openDropdown === 'group' && (
                <div className={styles.dropdown}>
                  {GROUP_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownOption} ${groupBy === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setGroupBy(opt.value);
                        setOpenDropdown(null);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.toolBtnWrapper}>
              <button
                type="button"
                className={`${styles.toolBtn} ${openDropdown === 'filter' ? styles.toolBtnActive : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'filter' ? null : 'filter')}
              >
                Filter
                <ChevronIcon size={14} direction={openDropdown === 'filter' ? 'up' : 'down'} />
              </button>
              {openDropdown === 'filter' && (
                <div className={styles.dropdown}>
                  {FILTER_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownOption} ${filterStatus === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setFilterStatus(opt.value);
                        setOpenDropdown(null);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.toolBtnWrapper}>
              <button
                type="button"
                className={`${styles.toolBtn} ${openDropdown === 'sort' ? styles.toolBtnActive : ''}`}
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              >
                Sort by...
                <ChevronIcon size={14} direction={openDropdown === 'sort' ? 'up' : 'down'} />
              </button>
              {openDropdown === 'sort' && (
                <div className={styles.dropdown}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownOption} ${sortValue === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setSortValue(opt.value);
                        setOpenDropdown(null);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Table */}
        <section className={styles.tableSection}>
          <Table<Trip & { no: number }>
            columns={columns}
            data={tableData}
            isLoading={isLoading}
            emptyMessage="No trips. Open the New Trip Form below to dispatch one."
          />
        </section>

        {/* Exception: NEW TRIP FORM button below the table */}
        <div className={styles.newTripFormButtonRow}>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className={styles.newTripFormBtn}
            onClick={() => setIsFormOpen((open) => !open)}
          >
            {isFormOpen ? 'Close New Trip Form' : 'NEW TRIP FORM'}
          </Button>
        </div>

        {/* Inline form – appears below button when opened */}
        <div className={styles.newTripFormRow}>
          {isFormOpen && (
            <div className={styles.inlineForm}>
              <form noValidate>
                {cargoError && (
                  <div className={styles.alertRow}>
                    <Alert type="error" title="Too heavy!" message="Cargo exceeds vehicle capacity. Reduce weight or choose a larger vehicle." />
                  </div>
                )}
                <div className={styles.inlineFormFields}>
                  <Select
                    label="Select Vehicle"
                    options={availableVehicles.map((v) => ({ value: v.value, label: v.label }))}
                    value={formData.vehicleId}
                    onChange={(val) => handleFormChange('vehicleId', val)}
                    error={formErrors.vehicleId}
                    placeholder="Select vehicle..."
                  />
                  <Input
                    label="Cargo Weight (Kg)"
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.cargoWeight}
                    onChange={(e) => handleFormChange('cargoWeight', e.target.value)}
                    error={formErrors.cargoWeight || (cargoError ? ' ' : undefined)}
                  />
                  <Select
                    label="Select Driver"
                    options={availableDrivers}
                    value={formData.driverId}
                    onChange={(val) => handleFormChange('driverId', val)}
                    error={formErrors.driverId}
                    placeholder="Select driver..."
                  />
                  <Input
                    label="Origin Address"
                    placeholder="e.g. Mumbai"
                    value={formData.originAddress}
                    onChange={(e) => handleFormChange('originAddress', e.target.value)}
                    error={formErrors.originAddress}
                  />
                  <Input
                    label="Destination"
                    placeholder="e.g. Pune"
                    value={formData.destination}
                    onChange={(e) => handleFormChange('destination', e.target.value)}
                    error={formErrors.destination}
                  />
                  <Input
                    label="Estimated Fuel Cost"
                    type="number"
                    placeholder="e.g. 2500"
                    value={formData.estimatedFuelCost}
                    onChange={(e) => handleFormChange('estimatedFuelCost', e.target.value)}
                  />
                </div>
                <div className={styles.confirmRow}>
                  <Button
                    variant="secondary"
                    className={styles.confirmBtn}
                    onClick={() => handleCreateTrip('DRAFT')}
                    disabled={isCargoOverload}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    className={styles.confirmBtn}
                    onClick={() => handleCreateTrip('DISPATCHED')}
                    disabled={isCargoOverload}
                  >
                    Confirm & Dispatch Trip
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </PageWrapper>
    </AppLayout>
  );
};
