import React, { useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import styles from './AddTripModal.module.css';

interface AddTripModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (trip: any) => void;
}

/** Populated from API when vehicles/drivers endpoints are wired */
const VEHICLE_OPTIONS: { value: string; label: string }[] = [];
const DRIVER_OPTIONS: { value: string; label: string }[] = [];

export const AddTripModal: React.FC<AddTripModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        vehicleId: '',
        driverId: '',
        origin: '',
        destination: '',
        cargoWeight: '',
        estimatedFuel: '',
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
        if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle selection is required';
        if (!formData.driverId) newErrors.driverId = 'Driver selection is required';
        if (!formData.origin) newErrors.origin = 'Origin is required';
        if (!formData.destination) newErrors.destination = 'Destination is required';
        if (!formData.cargoWeight) newErrors.cargoWeight = 'Cargo weight is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAdd(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Dispatch New Trip" size="md">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <Select
                        label="Select Vehicle"
                        options={VEHICLE_OPTIONS}
                        value={formData.vehicleId}
                        onChange={(val) => handleChange('vehicleId', val)}
                        error={errors.vehicleId}
                    />
                    <Select
                        label="Assign Driver"
                        options={DRIVER_OPTIONS}
                        value={formData.driverId}
                        onChange={(val) => handleChange('driverId', val)}
                        error={errors.driverId}
                    />
                    <Input
                        label="Origin City"
                        placeholder="e.g. Mumbai"
                        value={formData.origin}
                        onChange={(e) => handleChange('origin', e.target.value)}
                        error={errors.origin}
                    />
                    <Input
                        label="Destination City"
                        placeholder="e.g. Pune"
                        value={formData.destination}
                        onChange={(e) => handleChange('destination', e.target.value)}
                        error={errors.destination}
                    />
                    <Input
                        label="Cargo Weight (kg)"
                        type="number"
                        placeholder="e.g. 5000"
                        value={formData.cargoWeight}
                        onChange={(e) => handleChange('cargoWeight', e.target.value)}
                        error={errors.cargoWeight}
                    />
                    <Input
                        label="Estimated Fuel Cost (₹)"
                        type="number"
                        placeholder="e.g. 2500"
                        value={formData.estimatedFuel}
                        onChange={(e) => handleChange('estimatedFuel', e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Discard
                    </Button>
                    <Button type="submit" variant="primary" className={styles.submitBtn}>
                        Confirm Dispatch
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
