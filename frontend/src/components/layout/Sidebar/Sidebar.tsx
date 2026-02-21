import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLayoutStore } from '../../../stores/layoutStore';
import { ROUTES } from '../../../constants/routes';
import { canAccessRoute } from '../../../constants/roles';
import {
  DashboardIcon,
  TruckIcon,
  RouteIcon,
  WrenchIcon,
  WalletIcon,
  DriverIcon,
  BarChartIcon,
} from '../../../assets/icons';
import styles from './Sidebar.module.css';

const allNavItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: DashboardIcon },
  { path: ROUTES.VEHICLES, label: 'Vehicle Registry', icon: TruckIcon },
  { path: ROUTES.TRIPS, label: 'Trip Dispatcher', icon: RouteIcon },
  { path: ROUTES.MAINTENANCE, label: 'Maintenance', icon: WrenchIcon },
  { path: ROUTES.EXPENSES, label: 'Trip & Expense', icon: WalletIcon },
  { path: ROUTES.DRIVERS, label: 'Performance', icon: DriverIcon },
  { path: ROUTES.ANALYTICS, label: 'Analytics', icon: BarChartIcon },
];

interface SidebarProps {
  userName?: string;
  role?: string;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userName = 'User',
  role = 'Manager',
  onLogout,
}) => {
  const location = useLocation();
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const { user } = useAuth();
  const navItems = user?.role
    ? allNavItems.filter((item) => canAccessRoute(item.path, user.role))
    : allNavItems;

  return (
    <aside
      className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : styles.expanded}`}
    >
      <div className={styles.logoSection}>
        <div className={styles.logo}>Fleet Flow</div>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              <span className={styles.icon}>
                <Icon size={20} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.userSection}>
        <div className={styles.userName}>{userName}</div>
        <span className={styles.roleBadge}>{role}</span>
        {onLogout && (
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>
            Log out
          </button>
        )}
      </div>
    </aside>
  );
};
