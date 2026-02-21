import { MenuIcon } from '../../../assets/icons';
import { useLayoutStore } from '../../../stores/layoutStore';
import styles from './TopBar.module.css';

interface TopBarProps {
  title: string;
  breadcrumb?: string;
  pageAction?: React.ReactNode;
  hasAlerts?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  breadcrumb,
  pageAction,
  hasAlerts = false,
}) => {
  const toggleSidebar = useLayoutStore((s) => s.toggleSidebar);

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.titleRow}>
          <button
            type="button"
            className={styles.hamburger}
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <MenuIcon size={24} />
          </button>
          <h2 className={styles.title}>{title}</h2>
        </div>
        {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
      </div>
      <div className={styles.right}>
        {hasAlerts && (
          <div className={styles.bellWrapper} title="Maintenance alerts">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className={styles.bellDot} />
          </div>
        )}
        {pageAction}
      </div>
    </header>
  );
};
