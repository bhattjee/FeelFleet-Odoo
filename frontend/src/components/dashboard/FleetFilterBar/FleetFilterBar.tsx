import React from 'react';
import styles from './FleetFilterBar.module.css';

export type VehicleTypeFilter = 'all' | 'truck' | 'van' | 'bike';
export type StatusFilter = 'all' | 'available' | 'ontrip' | 'inshop';

interface FleetFilterBarProps {
  vehicleType: VehicleTypeFilter;
  status: StatusFilter;
  onVehicleTypeChange: (v: VehicleTypeFilter) => void;
  onStatusChange: (v: StatusFilter) => void;
}

const vehicleOptions: { value: VehicleTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'bike', label: 'Bike' },
];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'ontrip', label: 'On Trip' },
  { value: 'inshop', label: 'In Shop' },
];

export const FleetFilterBar: React.FC<FleetFilterBarProps> = ({
  vehicleType,
  status,
  onVehicleTypeChange,
  onStatusChange,
}) => {
  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Vehicle Type</span>
        <div className={styles.pills}>
          {vehicleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.pill} ${vehicleType === opt.value ? styles.pillActive : ''}`}
              onClick={() => onVehicleTypeChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.group}>
        <span className={styles.groupLabel}>Status</span>
        <div className={styles.pills}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.pill} ${status === opt.value ? styles.pillActive : ''}`}
              onClick={() => onStatusChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
