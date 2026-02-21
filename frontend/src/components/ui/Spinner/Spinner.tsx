import React from 'react';
import styles from './Spinner.module.css';

type Size = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: Size;
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color }) => {
  return (
    <span
      className={`${styles.root} ${styles[size]}`}
      style={color ? { color } : undefined}
      aria-hidden="true"
    />
  );
};

