import React, { useRef, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { AppLayout } from '../../components/layout/AppLayout/AppLayout';
import { PageWrapper } from '../../components/layout/PageWrapper/PageWrapper';
import { Button } from '../../components/ui/Button/Button';
import { ChevronIcon } from '../../assets/icons';
import { KPICard } from '../../components/dashboard/KPICard/KPICard';
import { Table } from '../../components/ui/Table/Table';
import type { TableColumn } from '../../components/ui/Table/Table';
import styles from './AnalyticsPage.module.css';

interface FinancialRecord extends Record<string, unknown> {
  month: string;
  revenue: string;
  investment: string;
  fuelCost: string;
  maintenance: string;
  netProfit: string;
  roi: string;
}

const chartTickStyle = { fill: 'var(--color-text-muted)', fontSize: 11 };
const chartStroke = 'var(--color-border)';

export const AnalyticsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const tableRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'group' | 'filter' | 'sort' | null>(null);
  const [financialSummaryData, setFinancialSummaryData] = useState<FinancialRecord[]>([]);
  const [fuelTrend, setFuelTrend] = useState<{ month: string, kmL: number }[]>([]);
  const [costlyVehicles, setCostlyVehicles] = useState<{ vehicle: string, cost: number }[]>([]);
  const [kpis, setKpis] = useState({ fuelCost: 0, roi: 0, utilization: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, efficiencyRes, costlyRes, summaryRes] = await Promise.all([
        fetch('/api/analytics/kpis'),
        fetch('/api/analytics/fuel-efficiency'),
        fetch('/api/analytics/costly-vehicles'),
        fetch('/api/analytics/financial-summary'),
      ]);

      if (kpiRes.ok) {
        const { data } = await kpiRes.json();
        // roi and utilization are in the KPI object
        setKpis(prev => ({ ...prev, roi: data.roi || 0, utilization: data.utilizationRate || 0 }));
      }

      if (efficiencyRes.ok) {
        const { data } = await efficiencyRes.json();
        setFuelTrend(data);
      }

      if (costlyRes.ok) {
        const { data } = await costlyRes.json();
        setCostlyVehicles(data);
      }

      if (summaryRes.ok) {
        const { data } = await summaryRes.json();
        setKpis(prev => ({ ...prev, fuelCost: data.totalFuel }));
        // For the table, we show it as a single row representing current summary
        setFinancialSummaryData([{
          month: 'Total (Real-time)',
          revenue: `Rs. ${(data.totalRevenue / 100).toLocaleString()}`,
          investment: `Rs. ${(data.totalInvestment / 100).toLocaleString()}`,
          fuelCost: `Rs. ${(data.totalFuel / 100).toLocaleString()}`,
          maintenance: `Rs. ${(data.totalMaintenance / 100).toLocaleString()}`,
          netProfit: `Rs. ${(data.netProfit / 100).toLocaleString()}`,
          roi: `${Math.round(data.roi || 0)}%`,
        }]);
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
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

  const columns: TableColumn<FinancialRecord>[] = [
    { key: 'month', label: 'Summary Period' },
    { key: 'revenue', label: 'Trip Revenue' },
    { key: 'investment', label: 'Asset Investment' },
    { key: 'fuelCost', label: 'Fuel Spend' },
    { key: 'maintenance', label: 'Maint. Spend' },
    { key: 'netProfit', label: 'Net Profit' },
    { key: 'roi', label: 'ROI %' },
  ];

  const handleFinancialSummaryClick = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    const headers = ['Summary Period', 'Trip Revenue', 'Asset Investment', 'Fuel Spend', 'Maint. Spend', 'Net Profit', 'ROI %'];
    const rows = financialSummaryData.map((r) => [r.month, r.revenue, r.investment, r.fuelCost, r.maintenance, r.netProfit, r.roi]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-summary-${new Date().toISOString().slice(0, 7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      pageTitle="Operational Analytics & Financial Reports"
      breadcrumb="Fleet Flow"
      userName={user?.name}
      userRole={user?.role}
      onLogout={logout}
    >
      <PageWrapper>
        {/* Universal: Search + Group by, Filter, Sort by */}
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
                  <button type="button" className={styles.dropdownOption} onClick={() => setOpenDropdown(null)}>None</button>
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
                  <button type="button" className={styles.dropdownOption} onClick={() => setOpenDropdown(null)}>All</button>
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
                  <button type="button" className={styles.dropdownOption} onClick={() => setOpenDropdown(null)}>Default</button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <section className={styles.cards}>
          <KPICard label="Total Fuel Cost" value={`Rs. ${(kpis.fuelCost / 100).toLocaleString()}`} alertLevel="normal" />
          <KPICard label="Fleet ROI" value={`${Math.round(kpis.roi)}%`} alertLevel={kpis.roi < 0 ? 'critical' : 'normal'} />
          <KPICard label="Utilization Rate" value={`${kpis.utilization}%`} alertLevel="normal" />
        </section>

        {/* Two charts */}
        <section className={styles.charts}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Fuel Efficiency Trend (km/L)</h3>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={fuelTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} />
                  <XAxis dataKey="month" tick={chartTickStyle} stroke={chartStroke} />
                  <YAxis tick={chartTickStyle} stroke={chartStroke} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                    labelStyle={{ color: 'var(--color-text-muted)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kmL"
                    stroke="var(--color-success)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--color-success)', r: 4 }}
                    name="km/L"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Top 5 Costliest Vehicles</h3>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={costlyVehicles} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} vertical={false} />
                  <XAxis dataKey="vehicle" tick={chartTickStyle} stroke={chartStroke} />
                  <YAxis tick={chartTickStyle} stroke={chartStroke} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <Bar dataKey="cost" fill="var(--color-accent)" name="Cost (Rs.)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Financial Summary button */}
        <div className={styles.buttonRow}>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className={styles.financialSummaryBtn}
            onClick={handleFinancialSummaryClick}
          >
            REFRESH FINANCIAL DATA
          </Button>
        </div>

        {/* Financial Summary table */}
        <section className={styles.tableSection} ref={tableRef}>
          <Table<FinancialRecord>
            columns={columns}
            data={financialSummaryData}
            isLoading={isLoading}
            emptyMessage="No financial data available."
          />
        </section>
      </PageWrapper>
    </AppLayout>
  );
};
