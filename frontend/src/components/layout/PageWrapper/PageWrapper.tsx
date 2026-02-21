import React from 'react';
import styles from './PageWrapper.module.css';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className }) => {
  return (
    <main className={`${styles.wrapper} ${className ?? ''}`.trim()}>
      {children}
    </main>
  );
};
