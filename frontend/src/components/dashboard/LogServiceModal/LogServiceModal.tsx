import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import { getVehicles } from '../../../api/vehicles';
import type { CreateServiceLogPayload, ServiceType } from '../../../api/maintenance';
import styles from './LogServiceModal.module.css';

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'OIL_CHANGE', label: 'Oil Change' },
  { value: 'BRAKE_SERVICE', label: 'Brake Service' },
  { value: 'ENGINE_REPAIR', label: 'Engine Repair' },
  { value: 'TIRE_REPLACEMENT', label: 'Tire Replacement' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'OTHER', label: 'Other' },
];

interface LogServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (payload: CreateServiceLogPayload) => void;
  error?: string | null;
}

export const LogServiceModal: React.FC<LogServiceModalProps> = ({ isOpen, onClose, onLog, error }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'OIL_CHANGE' as ServiceType,
    description: '',
    technicianName: '',
    cost: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '09:00',
  });
  const [vehicles, setVehicles] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingVehicles(true);
      getVehicles()
        .then((list) => {
          setVehicles(
            list.map((v) => ({
              value: v.id,
              label: `${v.name || v.licensePlate} (${v.licensePlate})`,
            }))
          );
        })
        .catch(() => setVehicles([]))
        .finally(() => setIsLoadingVehicles(false));
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
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
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 5) newErrors.description = 'Description must be at least 5 characters';
    if (!formData.technicianName.trim()) newErrors.technicianName = 'Technician name is required';
    else if (formData.technicianName.trim().length < 2) newErrors.technicianName = 'Technician name must be at least 2 characters';
    const costNum = Number(formData.cost);
    if (formData.cost === '' || !Number.isInteger(costNum) || costNum <= 0) {
      newErrors.cost = 'Cost (₹) is required and must be a positive number';
    }
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const scheduledDateIso = new Date(`${formData.scheduledDate}T${formData.scheduledTime}:00`).toISOString();
    const costPaise = Math.round(Number(formData.cost) * 100);

    onLog({
      vehicleId: formData.vehicleId,
      serviceType: formData.serviceType,
      description: formData.description.trim(),
      technicianName: formData.technicianName.trim(),
      cost: costPaise,
      scheduledDate: scheduledDateIso,
    });
    setFormData({
      vehicleId: '',
      serviceType: 'OIL_CHANGE',
      description: '',
      technicianName: '',
      cost: '',
      scheduledDate: new Date().toISOString().slice(0, 10),
      scheduledTime: '09:00',
    });
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Service Log" size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.formError} role="alert">
            {error}
          </div>
        )}
        <div className={styles.grid}>
          <Select
            label="Select Vehicle"
            options={vehicles}
            value={formData.vehicleId}
            onChange={(val) => handleChange('vehicleId', val)}
            error={errors.vehicleId}
            disabled={isLoadingVehicles}
            placeholder={isLoadingVehicles ? 'Loading vehicles...' : 'Select vehicle'}
          />
          <Select
            label="Issue / Service"
            options={SERVICE_TYPES}
            value={formData.serviceType}
            onChange={(val) => handleChange('serviceType', val)}
          />
          <Input
            label="Description"
            placeholder="e.g. Regular oil change and filter replacement"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={errors.description}
          />
          <Input
            label="Technician Name"
            placeholder="e.g. Mike Smith"
            value={formData.technicianName}
            onChange={(e) => handleChange('technicianName', e.target.value)}
            error={errors.technicianName}
          />
          <Input
            label="Cost (₹)"
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 4500"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            error={errors.cost}
          />
          <Input
            label="Scheduled Date"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleChange('scheduledDate', e.target.value)}
            error={errors.scheduledDate}
          />
          <Input
            label="Scheduled Time"
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => handleChange('scheduledTime', e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className={styles.submitBtn}>
            Create Service Log
          </Button>
        </div>
      </form>
    </Modal>
  );
};
