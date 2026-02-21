import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  registration?: UseFormRegisterReturn;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  registration,
  disabled,
  className,
  ...rest
}) => {
  const hasError = Boolean(error);

  return (
    <div className={styles.field}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>{label}</label>
          {helperText && !error && <span className={styles.helper}>{helperText}</span>}
        </div>
      )}
      <div className={`${styles.controlWrapper} ${disabled ? styles.disabled : ''}`}>
        {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
        <input
          className={[
            styles.input,
            leftIcon ? styles.inputWithIcon : '',
            hasError ? styles.errorInput : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={disabled}
          {...registration}
          {...rest}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

