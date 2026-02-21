import React from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  className,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={[
        styles.root,
        styles[variant],
        styles[size],
        isDisabled ? styles.disabled : '',
        isLoading ? styles.loading : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

