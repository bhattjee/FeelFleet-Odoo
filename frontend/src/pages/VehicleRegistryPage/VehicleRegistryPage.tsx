import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { PlusIcon } from '../../assets/icons';
import { ChevronIcon } from '../../assets/icons';
import { NewVehicleRegistrationModal } from '../../components/dashboard/NewVehicleRegistrationModal/NewVehicleRegistrationModal';
import type { Vehicle } from '../../api/vehicles';
import { getVehicles, createVehicle, retireVehicle, updateVehicle } from '../../api/vehicles';
import type { NewVehicleFormData } from '../../components/dashboard/NewVehicleRegistrationModal/NewVehicleRegistrationModal';
import styles from './VehicleRegistryPage.module.css';

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'type', label: 'Type' },
  { value: 'status', label: 'Status' },
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'AVAILABLE', label: 'Idle' },
  { value: 'ON_TRIP', label: 'On Trip' },
  { value: 'IN_SHOP', label: 'In Shop' },
  { value: 'RETIRED', label: 'Retired' },
];

const FILTER_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'BIKE', label: 'Bike' },
];

const SORT_OPTIONS = [
  { value: 'plate_asc', label: 'Plate (A–Z)', key: 'licensePlate', dir: 'asc' as const },
  { value: 'plate_desc', label: 'Plate (Z–A)', key: 'licensePlate', dir: 'desc' as const },
  { value: 'model_asc', label: 'Model (A–Z)', key: 'model', dir: 'asc' as const },
  { value: 'model_desc', label: 'Model (Z–A)', key: 'model', dir: 'desc' as const },
  { value: 'type_asc', label: 'Type (A–Z)', key: 'type', dir: 'asc' as const },
  { value: 'odometer_asc', label: 'Odometer (Low–High)', key: 'odometer', dir: 'asc' as const },
  { value: 'odometer_desc', label: 'Odometer (High–Low)', key: 'odometer', dir: 'desc' as const },
  { value: 'capacity_asc', label: 'Capacity (Low–High)', key: 'maxCapacity', dir: 'asc' as const },
  { value: 'capacity_desc', label: 'Capacity (High–Low)', key: 'maxCapacity', dir: 'desc' as const },
];

function formatCapacity(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} ton`;
  return `${kg} kg`;
}

function getStatusLabel(status: string): string {
  if (status === 'AVAILABLE') return 'Idle';
  if (status === 'ON_TRIP') return 'On Trip';
  if (status === 'IN_SHOP') return 'In Shop';
  if (status === 'RETIRED') return 'Out of Service';
  return status;
}

function getTypeLabel(type: string): string {
  if (type === 'TRUCK') return 'Truck';
  if (type === 'VAN') return 'Van';
  if (type === 'BIKE') return 'Bike';
  return type;
}

export const VehicleRegistryPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('plate_asc');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load vehicles');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredVehicles = useMemo(() => {
    let list = vehicles.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.licensePlate.toLowerCase().includes(q) ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        v.model.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
      const matchesType = filterType === 'all' || v.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });

    const sortOpt = SORT_OPTIONS.find((o) => o.value === sortValue);
    if (sortOpt) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortOpt.key as keyof Vehicle];
        const bVal = b[sortOpt.key as keyof Vehicle];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const cmp = aVal.localeCompare(bVal);
          return sortOpt.dir === 'asc' ? cmp : -cmp;
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOpt.dir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    if (groupBy === 'type') {
      list = [...list].sort((a, b) => a.type.localeCompare(b.type));
    } else if (groupBy === 'status') {
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    }

    return list;
  }, [vehicles, searchQuery, filterStatus, filterType, sortValue, groupBy]);

  const handleRetire = useCallback(async (v: Vehicle) => {
    setTogglingId(v.id);
    setActionError(null);
    try {
      await retireVehicle(v.id);
      setVehicles((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: 'RETIRED' as const } : x)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to mark Out of Service');
    } finally {
      setTogglingId(null);
    }
  }, []);

  const handleReturnToService = useCallback(async (v: Vehicle) => {
    setTogglingId(v.id);
    setActionError(null);
    try {
      await updateVehicle(v.id, { status: 'AVAILABLE' });
      setVehicles((prev) => prev.map((x) => (x.id === v.id ? { ...x, status: 'AVAILABLE' as const } : x)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to return to service');
    } finally {
      setTogglingId(null);
    }
  }, []);

  const columns: TableColumn<Vehicle & { no: number }>[] = [
    {
      key: 'no',
      label: 'No',
      width: 48,
      render: (val) => val as number,
    },
    { key: 'name', label: 'Name' },
    { key: 'licensePlate', label: 'Plate', mono: true },
    { key: 'model', label: 'Model' },
    {
      key: 'type',
      label: 'Type',
      render: (val) => getTypeLabel(val as string),
    },
    {
      key: 'maxCapacity',
      label: 'Capacity',
      render: (val) => formatCapacity(val as number),
    },
    {
      key: 'odometer',
      label: 'Odometer',
      mono: true,
      render: (val) => `${(val as number).toLocaleString()} km`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_val, row) => {
        const s = row.status;
        const className =
          s === 'AVAILABLE'
            ? styles.statusIdle
            : s === 'ON_TRIP'
              ? styles.statusOnTrip
              : s === 'IN_SHOP'
                ? styles.statusInShop
                : styles.statusRetired;
        return <span className={className}>{getStatusLabel(s)}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 140,
      render: (_val, row) => {
        const isToggling = togglingId === row.id;
        if (row.status === 'RETIRED') {
          return (
            <button
              type="button"
              className={styles.actionCellBtnReturn}
              disabled={isToggling}
              onClick={(e) => {
                e.stopPropagation();
                handleReturnToService(row);
              }}
              title="Return to Service"
            >
              {isToggling ? '…' : 'Return to Service'}
            </button>
          );
        }
        return (
          <button
            type="button"
            className={styles.actionCellBtnRetired}
            disabled={isToggling || row.status === 'ON_TRIP'}
            onClick={(e) => {
              e.stopPropagation();
              handleRetire(row);
            }}
            title={row.status === 'ON_TRIP' ? 'Cannot retire while on trip' : 'Mark Out of Service'}
          >
            {isToggling ? '…' : 'Out of Service'}
          </button>
        );
      },
    },
  ];

  const tableData = useMemo(
    () =>
      filteredVehicles.map((v, index) => ({
        ...v,
        no: index + 1,
      })),
    [filteredVehicles]
  );

  const handleAddVehicle = useCallback(async (data: NewVehicleFormData) => {
    setActionError(null);
    try {
      const created = await createVehicle(data);
      setVehicles((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create vehicle');
    }
  }, []);

  return (
    <AppLayout
      pageTitle="Vehicle Registry (Asset Management)"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Universal: Search + Group by, Filter, Sort by only */}
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
                  <span className={styles.dropdownOption} style={{ cursor: 'default', opacity: 0.8 }}>
                    Status
                  </span>
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
                  <div className={styles.dropdownDivider} />
                  <span className={styles.dropdownOption} style={{ cursor: 'default', opacity: 0.8 }}>
                    Type
                  </span>
                  {FILTER_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownOption} ${filterType === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => {
                        setFilterType(opt.value);
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
                <div className={styles.dropdown} style={{ maxHeight: 280, overflowY: 'auto' }}>
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

        {/* New entry button – below the three buttons */}
        <div className={styles.actionRow}>
          <Button
            variant="primary"
            size="lg"
            className={styles.newVehicleBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            NEW VEHICLE
          </Button>
        </div>

        {actionError && (
          <div className={styles.errorBanner} role="alert">
            {actionError}
            <button type="button" className={styles.errorDismiss} onClick={() => setActionError(null)} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {/* Vehicle data table */}
        <section className={styles.tableSection}>
          <Table<Vehicle & { no: number }>
            columns={columns}
            data={tableData}
            isLoading={loading}
            emptyMessage="No vehicles registered. Click NEW VEHICLE to add one."
          />
        </section>

        <NewVehicleRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddVehicle}
        />
      </PageWrapper>
    </AppLayout>
  );
};
