import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { ChevronIcon } from '../../assets/icons';
import styles from './DriverProfilePage.module.css';

interface Driver extends Record<string, unknown> {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  completionRate: number;
  safetyScore: number;
  complaints: number;
  dutyStatus: 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED';
}

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'status', label: 'Status' },
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'ON_DUTY', label: 'On Duty' },
  { value: 'OFF_DUTY', label: 'Off Duty' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A–Z)', key: 'name', dir: 'asc' as const },
  { value: 'safety_desc', label: 'Safety Score (High–Low)', key: 'safetyScore', dir: 'desc' as const },
  { value: 'complaints_desc', label: 'Complaints (High–Low)', key: 'complaints', dir: 'desc' as const },
];

export const DriverProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('name_asc');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const { data } = await res.json();
        setDrivers(data);
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDrivers = useMemo(() => {
    let list = drivers.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || d.dutyStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const sortOpt = SORT_OPTIONS.find(o => o.value === sortValue);
    if (sortOpt) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortOpt.key as keyof Driver];
        const bVal = b[sortOpt.key as keyof Driver];
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

    if (groupBy === 'status') {
      list = [...list].sort((a, b) => a.dutyStatus.localeCompare(b.dutyStatus));
    }

    return list;
  }, [drivers, searchQuery, filterStatus, sortValue, groupBy]);

  const columns: TableColumn<Driver>[] = [
    { key: 'name', label: 'Name' },
    { key: 'licenseNumber', label: 'License#', mono: true },
    {
      key: 'licenseExpiry',
      label: 'Expiry',
      render: (val) => {
        const expiry = new Date(val as string);
        const today = new Date();
        const isExpired = expiry < today;
        return (
          <span style={{ color: isExpired ? '#ef4444' : 'inherit', fontWeight: isExpired ? 700 : 400 }}>
            {val as string} {isExpired && ' (Locked)'}
          </span>
        );
      }
    },
    {
      key: 'completionRate',
      label: 'Completion rate',
      render: (val) => `${val}%`
    },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      render: (val) => {
        const score = val as number;
        let color = '#22c55e'; // Green
        if (score < 80) color = '#f59e0b'; // Yellow
        if (score < 60) color = '#ef4444'; // Red
        return <span style={{ fontWeight: 700, color }}>{score}%</span>;
      }
    },
    { key: 'complaints', label: 'Complaints', width: 100 },
    {
      key: 'actions',
      label: 'Status Action',
      width: 150,
      render: (_, row) => {
        const nextStatusMap: Record<string, string> = {
          'ON_DUTY': 'OFF_DUTY',
          'OFF_DUTY': 'SUSPENDED',
          'SUSPENDED': 'ON_DUTY'
        };
        const nextStatus = nextStatusMap[row.dutyStatus] || 'ON_DUTY';

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusToggle(row.id, nextStatus)}
          >
            Go {nextStatus.replace('_', ' ')}
          </Button>
        );
      }
    }
  ];

  const handleStatusToggle = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/drivers/${id}/duty-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dutyStatus: status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to update duty status:', err);
    }
  };

  return (
    <AppLayout
      pageTitle="Driver performance and Safety Profiles"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Control bar: Search + Group by, Filter, Sort by */}
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

        {/* Drivers Table */}
        <section className={styles.tableSection}>
          <Table<Driver>
            columns={columns}
            data={filteredDrivers}
            isLoading={isLoading}
            emptyMessage="No drivers. Add drivers to see them here."
            rowIndicator={(row) => row.dutyStatus === 'ON_DUTY'}
          />
        </section>
      </PageWrapper>
    </AppLayout>
  );
};
