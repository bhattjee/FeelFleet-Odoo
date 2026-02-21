import React, { useState } from 'react';
import styles from './Tooltip.module.css';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: Position;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`${styles.bubble} ${styles[position]}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};
