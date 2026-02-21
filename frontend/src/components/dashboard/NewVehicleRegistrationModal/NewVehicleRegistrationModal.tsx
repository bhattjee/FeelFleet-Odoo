import React, { useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import type { CreateVehiclePayload, VehicleType } from '../../../api/vehicles';
import styles from './NewVehicleRegistrationModal.module.css';

export type NewVehicleFormData = CreateVehiclePayload;

interface NewVehicleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewVehicleFormData) => void;
}

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'BIKE', label: 'Bike' },
];

const currentYear = new Date().getFullYear();

export const NewVehicleRegistrationModal: React.FC<NewVehicleRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    licensePlate: '',
    year: String(currentYear),
    type: 'TRUCK' as VehicleType,
    maxCapacity: '',
    odometer: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    const yearNum = Number(formData.year);
    if (!formData.year || yearNum < 1990 || yearNum > currentYear) {
      newErrors.year = `Year must be between 1990 and ${currentYear}`;
    }
    if (!formData.maxCapacity || Number(formData.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'Max capacity (kg) is required';
    }
    if (formData.odometer === '' || Number(formData.odometer) < 0) {
      newErrors.odometer = 'Odometer (km) is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: formData.name.trim(),
      model: formData.model.trim(),
      licensePlate: formData.licensePlate.trim(),
      year: yearNum,
      type: formData.type,
      maxCapacity: Number(formData.maxCapacity),
      odometer: Number(formData.odometer),
    });
    setFormData({
      name: '',
      model: '',
      licensePlate: '',
      year: String(currentYear),
      type: 'TRUCK',
      maxCapacity: '',
      odometer: '',
    });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      model: '',
      licensePlate: '',
      year: String(currentYear),
      type: 'TRUCK',
      maxCapacity: '',
      odometer: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Vehicle Registration" size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Name"
          placeholder="e.g. Van-05, Titan-01"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
        />
        <Input
          label="Model"
          placeholder="e.g. Volvo FH16, Mercedes Sprinter"
          value={formData.model}
          onChange={(e) => handleChange('model', e.target.value)}
          error={errors.model}
        />
        <Input
          label="License Plate (Unique ID)"
          placeholder="e.g. MH-12-DE-1234"
          value={formData.licensePlate}
          onChange={(e) => handleChange('licensePlate', e.target.value)}
          error={errors.licensePlate}
        />
        <Input
          label="Year"
          type="number"
          placeholder={`e.g. ${currentYear}`}
          min={1990}
          max={currentYear}
          value={formData.year}
          onChange={(e) => handleChange('year', e.target.value)}
          error={errors.year}
        />
        <Select
          label="Type"
          options={VEHICLE_TYPES}
          value={formData.type}
          onChange={(val) => handleChange('type', val)}
        />
        <Input
          label="Max Load Capacity (kg)"
          type="number"
          placeholder="e.g. 5000"
          value={formData.maxCapacity}
          onChange={(e) => handleChange('maxCapacity', e.target.value)}
          error={errors.maxCapacity}
        />
        <Input
          label="Odometer (km)"
          type="number"
          placeholder="e.g. 0"
          value={formData.odometer}
          onChange={(e) => handleChange('odometer', e.target.value)}
          error={errors.odometer}
        />

        <div className={styles.actions}>
          <Button type="button" variant="danger" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className={styles.saveBtn}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
