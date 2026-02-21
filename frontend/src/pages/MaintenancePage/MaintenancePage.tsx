import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import { Badge } from '../../components/ui/Badge/Badge';
import { Button } from '../../components/ui/Button/Button';
import { PlusIcon, ChevronIcon } from '../../assets/icons';
import { LogServiceModal } from '../../components/dashboard/LogServiceModal/LogServiceModal';
import { getMaintenanceLogs, createServiceLog, completeService } from '../../api/maintenance';
import type { CreateServiceLogPayload } from '../../api/maintenance';
import styles from './MaintenancePage.module.css';

interface MaintenanceLogRow {
  id: string;
  vehiclePlate: string;
  serviceType: string;
  description: string;
  technician: string;
  cost: number;
  date: string;
  status: string;
}

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'serviceType', label: 'Service Type' },
  { value: 'status', label: 'Status' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'OIL_CHANGE', label: 'Oil' },
  { value: 'ENGINE_REPAIR', label: 'Engine' },
  { value: 'BRAKE_SERVICE', label: 'Brake' },
  { value: 'TIRE_REPLACEMENT', label: 'Tire' },
  { value: 'INSPECTION', label: 'Inspection' },
];

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date (Old–New)', key: 'date', dir: 'asc' as const },
  { value: 'date_desc', label: 'Date (New–Old)', key: 'date', dir: 'desc' as const },
  { value: 'cost_asc', label: 'Cost (Low–High)', key: 'cost', dir: 'asc' as const },
  { value: 'cost_desc', label: 'Cost (High–Low)', key: 'cost', dir: 'desc' as const },
];

export const MaintenancePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<MaintenanceLogRow[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState('none');
  const [sortValue, setSortValue] = useState('date_desc');
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setCreateError(null);
    try {
      const data = await getMaintenanceLogs();
      setLogs(
        data.map((l) => ({
          id: l.id,
          vehiclePlate: l.vehicle?.licensePlate ?? '',
          serviceType: l.serviceType,
          description: l.description,
          technician: l.technicianName,
          cost: l.cost,
          date: l.scheduledDate ? new Date(l.scheduledDate).toLocaleDateString() : '',
          status: l.status,
        }))
      );
    } catch (err) {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLogs = useMemo(() => {
    let list = logs.filter((l) => {
      const matchesSearch =
        !searchQuery ||
        l.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.technician.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || l.serviceType === typeFilter;
      return matchesSearch && matchesType;
    });

    const sortOpt = SORT_OPTIONS.find((o) => o.value === sortValue);
    if (sortOpt) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortOpt.key as keyof MaintenanceLogRow];
        const bVal = b[sortOpt.key as keyof MaintenanceLogRow];
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

    if (groupBy === 'serviceType') {
      list = [...list].sort((a, b) => a.serviceType.localeCompare(b.serviceType));
    } else if (groupBy === 'status') {
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    }

    return list;
  }, [logs, searchQuery, typeFilter, sortValue, groupBy]);

  const handleResolve = useCallback(
    async (id: string) => {
      try {
        await completeService(id, {
          completedDate: new Date().toISOString(),
        });
        loadLogs();
      } catch (err) {
        console.error('Failed to complete service:', err);
      }
    },
    [loadLogs]
  );

  const handleCreateLog = useCallback(
    async (payload: CreateServiceLogPayload) => {
      setCreateError(null);
      try {
        await createServiceLog(payload);
        loadLogs();
        setIsModalOpen(false);
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Failed to create service log');
      }
    },
    [loadLogs]
  );

  const columns: TableColumn<MaintenanceLogRow>[] = [
    { key: 'id', label: 'LogID', width: 100, mono: true },
    { key: 'vehiclePlate', label: 'Vehicle', mono: true },
    { key: 'serviceType', label: 'Issue / Service' },
    { key: 'date', label: 'Date' },
    {
      key: 'cost',
      label: 'Cost',
      render: (val) => `₹${((val as number) / 100).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const status = val as string;
        const variant = status === 'IN_PROGRESS' ? 'dispatched' : status === 'COMPLETED' ? 'completed' : 'draft';
        return <Badge variant={variant as 'draft' | 'dispatched' | 'completed'}>{status.replace('_', ' ')}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Action',
      width: 120,
      render: (_, row) => (
        <div className={styles.actionCell}>
          {row.status === 'IN_PROGRESS' && (
            <button type="button" className={styles.inlineActionBtn} onClick={() => handleResolve(row.id)}>
              Complete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      pageTitle="Maintenance and Service Logs"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Info/Documentation section */}
        <section className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>How Maintenance Tracking Works</h3>
            <p>
              When you log a <strong>NEW SERVICE</strong> (In Progress), the vehicle status automatically updates to
              <span className={styles.statusInShop}> IN SHOP</span>.
            </p>
            <p>
              While <strong>IN SHOP</strong>, the vehicle is automatically hidden from the Trip Dispatcher to prevent double-booking.
              Once the service is marked as <strong>COMPLETED</strong>, the vehicle will return to
              <span className={styles.statusAvailable}> AVAILABLE</span> for dispatching.
            </p>
          </div>
        </section>

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
                      onClick={() => { setGroupBy(opt.value); setOpenDropdown(null); }}
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
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.dropdownOption} ${typeFilter === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => { setTypeFilter(opt.value); setOpenDropdown(null); }}
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
                      onClick={() => { setSortValue(opt.value); setOpenDropdown(null); }}
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
            className={styles.logBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            CREATE NEW SERVICE
          </Button>
        </div>

        <section className={styles.tableSection}>
          <Table<MaintenanceLog>
            columns={columns}
            data={filteredLogs}
            isLoading={isLoading}
            emptyMessage="No maintenance logs. Click CREATE NEW SERVICE to add one."
            rowIndicator={(row) => row.status === 'IN_PROGRESS'}
          />
        </section>

        <LogServiceModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setCreateError(null); }}
          onLog={handleCreateLog}
          error={createError}
        />
      </PageWrapper>
    </AppLayout>
  );
};
