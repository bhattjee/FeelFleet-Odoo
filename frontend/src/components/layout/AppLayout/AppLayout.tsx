import React from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { TopBar } from '../TopBar/TopBar';
import { useLayoutStore } from '../../../stores/layoutStore';
import { formatRole } from '../../../utils/formatRole';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  breadcrumb?: string;
  pageAction?: React.ReactNode;
  hasAlerts?: boolean;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  pageTitle,
  breadcrumb,
  pageAction,
  hasAlerts,
  userName,
  userRole,
  onLogout,
}) => {
  const sidebarCollapsed = useLayoutStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  return (
    <div className={styles.layout}>
      {/* Sidebar is now a sliding overlay managed inside the Sidebar component */}
      <Sidebar userName={userName} role={formatRole(userRole)} onLogout={onLogout} />

      {/* Backdrop for mobile/tablet when sidebar is open */}
      <div
        className={`${styles.overlay} ${!sidebarCollapsed ? styles.overlayVisible : ''}`}
        onClick={toggleSidebar}
      />

      <div className={styles.mainSlot}>
        <TopBar
          title={pageTitle}
          breadcrumb={breadcrumb}
          pageAction={pageAction}
          hasAlerts={hasAlerts}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};
