import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'available'
  | 'ontrip'
  | 'inshop'
  | 'suspended'
  | 'retired'
  | 'draft'
  | 'dispatched'
  | 'completed'
  | 'cancelled'
  | 'onduty'
  | 'offduty';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  return <span className={`${styles.badge} ${styles[`badge--${variant}`]}`}>{children}</span>;
};

