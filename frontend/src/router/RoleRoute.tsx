import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { formatRole } from '../utils/formatRole';
import styles from './RoleRoute.module.css';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return null;

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className={styles.denied}>
        <h2 className={styles.title}>403 — Access Denied</h2>
        <p className={styles.message}>
          You do not have permission to access this page. Your role ({formatRole(user.role)}) is not allowed here.
        </p>
        <Link to={ROUTES.DASHBOARD} className={styles.backLink}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
