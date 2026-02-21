import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import { Button } from '../../components/ui/Button/Button';
import { PlusIcon } from '../../assets/icons';
import { ChevronIcon } from '../../assets/icons';
import { AddExpenseModal } from '../../components/dashboard/AddExpenseModal/AddExpenseModal';
import { LogFuelModal } from '../../components/dashboard/LogFuelModal/LogFuelModal';
import styles from './ExpensePage.module.css';

interface ExpenseRecord {
  id: string;
  tripId: string;
  driver: string;
  distance: string;
  fuelExpense: number;
  miscExpense: number;
  status: 'Done' | 'Pending';
  [key: string]: any;
}

const GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'driver', label: 'Driver' },
  { value: 'status', label: 'Status' },
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Done', label: 'Done' },
  { value: 'Pending', label: 'Pending' },
];

const SORT_OPTIONS = [
  { value: 'tripId_asc', label: 'Trip ID (A–Z)', key: 'tripId', dir: 'asc' as const },
  { value: 'tripId_desc', label: 'Trip ID (Z–A)', key: 'tripId', dir: 'desc' as const },
  { value: 'driver_asc', label: 'Driver (A–Z)', key: 'driver', dir: 'asc' as const },
  { value: 'fuel_desc', label: 'Fuel Expense (High–Low)', key: 'fuelExpense', dir: 'desc' as const },
  { value: 'fuel_asc', label: 'Fuel Expense (Low–High)', key: 'fuelExpense', dir: 'asc' as const },
];

function formatMoney(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return `₹${n.toLocaleString()}`;
}

export const ExpensePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortValue, setSortValue] = useState<string>('tripId_asc');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) {
        const { data } = await res.json();
        setExpenses(data.map((e: any) => ({
          id: e.id,
          tripId: e.tripId || 'None',
          driver: e.trip?.driverId || 'General',
          distance: e.trip ? `${(e.trip.odometerEnd || 0) - (e.trip.odometerStart || 0)} km` : '—',
          fuelExpense: e.type === 'FUEL' ? e.totalCost : 0,
          miscExpense: e.type !== 'FUEL' ? e.totalCost : 0,
          status: 'Done',
          type: e.type,
          date: new Date(e.date).toLocaleDateString(),
          vehiclePlate: e.vehicle?.licensePlate || '—',
        })));
      }
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredExpenses = useMemo(() => {
    let list = expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        e.tripId.toLowerCase().includes(q) ||
        e.driver.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    const sortOpt = SORT_OPTIONS.find((o) => o.value === sortValue);
    if (sortOpt) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortOpt.key as keyof ExpenseRecord];
        const bVal = b[sortOpt.key as keyof ExpenseRecord];
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

    if (groupBy === 'driver') {
      list = [...list].sort((a, b) => a.driver.localeCompare(b.driver));
    } else if (groupBy === 'status') {
      list = [...list].sort((a, b) => a.status.localeCompare(b.status));
    }

    return list;
  }, [expenses, searchQuery, filterStatus, sortValue, groupBy]);

  const columns: TableColumn<ExpenseRecord>[] = [
    { key: 'tripId', label: 'Trip ID', mono: true },
    { key: 'driver', label: 'Driver' },
    { key: 'distance', label: 'Distance' },
    {
      key: 'fuelExpense',
      label: 'Fuel Expense',
      render: (val) => formatMoney(val as number),
    },
    {
      key: 'miscExpense',
      label: 'Misc. Expen.',
      render: (val) => formatMoney(val as number),
    },
    { key: 'status', label: 'Status' },
  ];

  const handleCreateExpense = async (data: any) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };

  const handleLogFuel = async (data: any) => {
    try {
      const res = await fetch('/api/expenses/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          liters: Number(data.liters),
          costPerLiter: Number(data.costPerLiter),
          odometerAtFill: Number(data.odometerAtFill),
          date: new Date(data.date).toISOString(),
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Failed to log fuel:', err);
    }
  };

  return (
    <AppLayout
      pageTitle="Expense and Fuel Logging"
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

        {/* New entry button – below the three buttons */}
        <div className={styles.addExpenseRow}>
          <Button
            variant="secondary"
            size="lg"
            className={styles.addFuelBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setIsFuelModalOpen(true)}
          >
            LOG FUEL
          </Button>
          <Button
            variant="primary"
            size="lg"
            className={styles.addExpenseBtn}
            leftIcon={<PlusIcon size={18} />}
            onClick={() => setIsExpenseModalOpen(true)}
          >
            ADD AN EXPENSE
          </Button>
        </div>

        {/* Expenses Table */}
        <section className={styles.tableSection}>
          <Table<ExpenseRecord>
            columns={columns}
            data={filteredExpenses}
            isLoading={isLoading}
            emptyMessage="No expense records. Click ADD AN EXPENSE to create one."
          />
        </section>

        <AddExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onAdd={handleCreateExpense}
        />

        <LogFuelModal
          isOpen={isFuelModalOpen}
          onClose={() => setIsFuelModalOpen(false)}
          onLog={handleLogFuel}
        />
      </PageWrapper>
    </AppLayout>
  );
};
