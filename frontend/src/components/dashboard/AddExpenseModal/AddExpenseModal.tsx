import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import styles from './AddExpenseModal.module.css';

const EXPENSE_CATEGORIES = [
  { value: 'TOLL', label: 'Toll' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'OTHER', label: 'Other' },
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    tripId: '',
    type: 'TOLL',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [vehicles, setVehicles] = useState<{ value: string; label: string }[]>([]);
  const [trips, setTrips] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [vRes, tRes] = await Promise.all([
            fetch('/api/vehicles'),
            fetch('/api/trips?status=DISPATCHED')
          ]);
          if (vRes.ok) {
            const { data } = await vRes.json();
            setVehicles(data.map((v: any) => ({ value: v.id, label: `${v.name} (${v.licensePlate})` })));
          }
          if (tRes.ok) {
            const { data } = await tRes.json();
            setTrips(data.map((t: any) => ({ value: t.id, label: `Trip #${t.id} (${t.vehicle?.licensePlate})` })));
          }
        } catch (err) {
          console.error('Failed to fetch modal data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!formData.amount) newErrors.amount = 'Amount is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAdd(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add General Expense" size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fields}>
          <Select
            label="Select Vehicle"
            options={vehicles}
            value={formData.vehicleId}
            onChange={(val) => handleChange('vehicleId', val)}
            error={errors.vehicleId}
            disabled={isLoading}
          />
          <Select
            label="Associated Trip (Optional)"
            options={[{ value: '', label: 'None' }, ...trips]}
            value={formData.tripId}
            onChange={(val) => handleChange('tripId', val)}
          />
          <Select
            label="Expense Category"
            options={EXPENSE_CATEGORIES}
            value={formData.type}
            onChange={(val) => handleChange('type', val)}
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="e.g. 1500"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            error={errors.amount}
          />
          <Input
            label="Description"
            placeholder="e.g. Highway toll"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button type="submit" variant="primary" className={styles.createBtn}>
            Create Expense
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
