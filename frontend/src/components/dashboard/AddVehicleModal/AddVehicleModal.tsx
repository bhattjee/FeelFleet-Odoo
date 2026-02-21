import React, { useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import styles from './AddVehicleModal.module.css';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (vehicle: any) => void;
}

const VEHICLE_TYPES = [
    { value: 'TRUCK', label: 'Truck' },
    { value: 'VAN', label: 'Van' },
    { value: 'BIKE', label: 'Bike' },
];

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        licensePlate: '',
        year: new Date().getFullYear(),
        type: 'TRUCK',
        maxCapacity: '',
        odometer: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.licensePlate) newErrors.licensePlate = 'License plate is required';
        if (!formData.maxCapacity) newErrors.maxCapacity = 'Capacity is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAdd(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle" size="md">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <Input
                        label="Vehicle Name"
                        placeholder="e.g. Titan-01"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                    />
                    <Input
                        label="License Plate"
                        placeholder="e.g. MH-12-DE-1234"
                        value={formData.licensePlate}
                        onChange={(e) => handleChange('licensePlate', e.target.value)}
                        error={errors.licensePlate}
                    />
                    <Select
                        label="Vehicle Type"
                        options={VEHICLE_TYPES}
                        value={formData.type}
                        onChange={(val) => handleChange('type', val)}
                    />
                    <Input
                        label="Model"
                        placeholder="e.g. Tata Ace Gold"
                        value={formData.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                    />
                    <Input
                        label="Manufacturing Year"
                        type="number"
                        value={formData.year.toString()}
                        onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    />
                    <Input
                        label="Max Capacity (kg)"
                        type="number"
                        placeholder="e.g. 1500"
                        value={formData.maxCapacity}
                        onChange={(e) => handleChange('maxCapacity', e.target.value)}
                        error={errors.maxCapacity}
                    />
                    <Input
                        label="Initial Odometer (km)"
                        type="number"
                        placeholder="e.g. 0"
                        value={formData.odometer}
                        onChange={(e) => handleChange('odometer', e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" className={styles.submitBtn}>
                        Confirm Registration
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
