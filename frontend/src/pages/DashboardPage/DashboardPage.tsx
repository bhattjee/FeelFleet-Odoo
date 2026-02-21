import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { KPICard } from '../../components/dashboard/KPICard/KPICard';
import { Table } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { Badge } from '../../components/ui/Badge/Badge';
import { PlusIcon, ChevronIcon } from '../../assets/icons';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { api } from '../../api/client';
import styles from './DashboardPage.module.css';

const columns = [
  { key: 'id', label: 'Trip', mono: true },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'driver', label: 'Driver' },
  {
    key: 'status',
    label: 'Status',
    render: (val: unknown) => (
      <Badge variant={(val as string) === 'On Trip' ? 'dispatched' : 'completed'}>
        {val as string}
      </Badge>
    ),
  },
];

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'status', label: 'Status' },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'On Trip', label: 'On Trip' },
  { value: 'Completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'id_asc', label: 'Trip (A–Z)' },
  { value: 'driver_asc', label: 'Driver (A–Z)' },
];

const FILTER_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'BIKE', label: 'Bike' },
];

const FILTER_REGION_OPTIONS = [
  { value: 'all', label: 'All regions' },
  { value: 'North', label: 'North' },
  { value: 'South', label: 'South' },
  { value: 'East', label: 'East' },
  { value: 'West', label: 'West' },
];

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState('none');
  const [filterVal, setFilterVal] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [sortVal, setSortVal] = useState('id_asc');
  const [kpis, setKpis] = useState({ activeFleet: 0, maintenanceAlerts: 0, pendingCargo: 0, utilizationRate: 0 });
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoadingKPIs, setIsLoadingKPIs] = useState(true);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoadingTrips(true);
        const res = await api.get<any>('/api/trips?limit=10');
        if (res.success && res.data) {
          setTrips(Array.isArray(res.data) ? res.data : (res.data as any).trips || []);
        }
      } catch (err) {
        console.error('Failed to fetch trips for dashboard:', err);
      } finally {
        setIsLoadingTrips(false);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setIsLoadingKPIs(true);
        const params = new URLSearchParams();
        if (filterVal !== 'all') params.append('status', filterVal.toUpperCase().replace(' ', '_'));
        if (filterType !== 'all') params.append('type', filterType);
        if (filterRegion !== 'all') params.append('region', filterRegion);

        const res = await api.get<any>(`/api/analytics/kpis?${params.toString()}`);
        if (res.success && res.data) {
          setKpis(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch KPIs:', err);
      } finally {
        setIsLoadingKPIs(false);
      }
    };
    fetchKPIs();
  }, [filterVal, filterType, filterRegion]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <AppLayout
      pageTitle="Main Dashboard"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Universal: Search + Group by, Filter, Sort by only */}
        <section className={styles.controlBar}>
          <input
            type="text"
            placeholder="Search bar ......"
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
                <div className={styles.dropdown} style={{ minWidth: 200 }}>
                  <div className={styles.filterSection}>
                    <div className={styles.filterGroupLabel}>Status</div>
                    {FILTER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.dropdownOption} ${filterVal === opt.value ? styles.dropdownOptionActive : ''}`}
                        onClick={() => { setFilterVal(opt.value); setOpenDropdown(null); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.filterDivider} />
                  <div className={styles.filterSection}>
                    <div className={styles.filterGroupLabel}>Vehicle Type</div>
                    {FILTER_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.dropdownOption} ${filterType === opt.value ? styles.dropdownOptionActive : ''}`}
                        onClick={() => { setFilterType(opt.value); setOpenDropdown(null); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className={styles.filterDivider} />
                  <div className={styles.filterSection}>
                    <div className={styles.filterGroupLabel}>Region</div>
                    {FILTER_REGION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`${styles.dropdownOption} ${filterRegion === opt.value ? styles.dropdownOptionActive : ''}`}
                        onClick={() => { setFilterRegion(opt.value); setOpenDropdown(null); }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
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
                      className={`${styles.dropdownOption} ${sortVal === opt.value ? styles.dropdownOptionActive : ''}`}
                      onClick={() => { setSortVal(opt.value); setOpenDropdown(null); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* New entry buttons – below the three buttons */}
        <div className={styles.actionRow}>
          <Button
            variant="primary"
            size="lg"
            className={styles.actionBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => navigate(ROUTES.TRIPS)}
          >
            NEW TRIP
          </Button>
          <Button
            variant="primary"
            size="lg"
            className={styles.actionBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => navigate(ROUTES.VEHICLES)}
          >
            NEW VEHICLE
          </Button>
        </div>

        {/* KPI Section */}
        <section className={styles.kpiSection}>
          <KPICard label="Active Fleet" value={kpis.activeFleet} alertLevel={kpis.activeFleet > 0 ? 'normal' : 'warning'} />
          <KPICard label="Maintenance Alert" value={kpis.maintenanceAlerts} alertLevel="normal" />
          <KPICard label="Utilization Rate" value={kpis.utilizationRate} unit="%" alertLevel="normal" />
          <KPICard label="Pending Cargo" value={kpis.pendingCargo} alertLevel={kpis.pendingCargo > 5 ? 'warning' : 'normal'} />
        </section>

        {/* Table Section */}
        <section className={styles.tableSection}>
          <Table
            columns={columns}
            data={trips.map(t => ({
              ...t,
              vehicle: t.vehicle?.licensePlate || 'N/A',
              driver: t.driver?.name || 'N/A',
              status: t.status === 'DISPATCHED' ? 'On Trip' : t.status === 'COMPLETED' ? 'Completed' : t.status
            }))}
            isLoading={isLoadingTrips}
            emptyMessage="No trips. Add vehicles and dispatch trips to see data here."
            rowIndicator={(row: any) => (row as { status: string }).status === 'On Trip'}
          />
        </section>
      </PageWrapper>
    </AppLayout>
  );
};
