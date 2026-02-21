import React from 'react';
import styles from './KPICard.module.css';

type AlertLevel = 'normal' | 'warning' | 'critical';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down';
  alertLevel?: AlertLevel;
  icon?: React.ReactNode;
  meta?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  alertLevel = 'normal',
  icon,
  meta,
}) => {
  const valueClass =
    alertLevel === 'warning'
      ? styles.valueWarning
      : alertLevel === 'critical'
        ? styles.valueCritical
        : '';

  return (
    <div
      className={[
        styles.card,
        alertLevel === 'warning' ? styles.warning : '',
        alertLevel === 'critical' ? styles.critical : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${valueClass}`}>
        {value}
        {unit && <span style={{ fontSize: '0.6em', marginLeft: 4 }}>{unit}</span>}
      </div>
      {meta && <div className={styles.meta}>{meta}</div>}
    </div>
  );
};
