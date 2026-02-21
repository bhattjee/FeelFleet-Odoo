import React from 'react';
import { ChevronIcon } from '../../../assets/icons';
import styles from './Table.module.css';

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  mono?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  sortKey?: keyof T | string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: keyof T | string) => void;
  rowIndicator?: (row: T) => boolean;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  isLoading,
  emptyMessage = 'No records found',
  sortKey,
  sortDir,
  onSort,
  rowIndicator,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead className={styles.header}>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={styles.th} style={{ width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className={styles.skeletonRow}>
                {columns.map((col) => (
                  <td key={String(col.key)} className={styles.skeletonCell} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.empty}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={[
                  styles.th,
                  col.sortable ? styles.thSortable : '',
                  sortKey === col.key ? styles.thActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ width: col.width }}
                onClick={col.sortable && onSort ? () => onSort(col.key as keyof T) : undefined}
              >
                {col.label}
                {col.sortable && (
                  <span className={styles.sortIcon} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <ChevronIcon size={12} direction={sortKey === col.key && sortDir === 'asc' ? 'up' : 'down'} />
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className={[
                styles.row,
                onRowClick ? styles.rowClickable : '',
                rowIndicator?.(row) ? styles.rowIndicator : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => {
                const value = (row as Record<string, unknown>)[col.key as string];
                const content = col.render ? col.render(value, row) : value;
                return (
                  <td
                    key={String(col.key)}
                    className={[styles.cell, col.mono ? styles.cellMono : ''].filter(Boolean).join(' ')}
                  >
                    {content as React.ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
