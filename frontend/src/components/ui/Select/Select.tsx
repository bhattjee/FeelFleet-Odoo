import React, { useState, useRef, useEffect } from 'react';
import { ChevronIcon } from '../../../assets/icons';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select...',
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);
  const hasError = Boolean(error);

  return (
    <div className={styles.field} ref={wrapperRef}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        <button
          type="button"
          className={[
            styles.trigger,
            hasError ? styles.triggerError : '',
            disabled ? styles.triggerDisabled : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
        >
          <span className={!selected ? styles.placeholder : ''}>
            {selected ? selected.label : placeholder}
          </span>
          <span className={styles.chevron}>
            <ChevronIcon size={14} direction={isOpen ? 'up' : 'down'} />
          </span>
        </button>
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((opt) => (
              <div
                key={opt.value}
                className={[styles.option, opt.value === value ? styles.optionSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
