import React from 'react';
import styles from './Alert.module.css';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  type: AlertType;
  title: string;
  message?: string;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message, onDismiss, icon }) => {
  return (
    <div className={`${styles.root} ${styles[type]}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {message && <div className={styles.message}>{message}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.close} onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
};

