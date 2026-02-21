import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Select } from '../../ui/Select/Select';
import { Button } from '../../ui/Button/Button';
import styles from './LogFuelModal.module.css';

interface LogFuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (data: any) => void;
}

export const LogFuelModal: React.FC<LogFuelModalProps> = ({ isOpen, onClose, onLog }) => {
    const [formData, setFormData] = useState({
        vehicleId: '',
        tripId: '',
        liters: '',
        costPerLiter: '',
        odometerAtFill: '',
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
        if (!formData.liters) newErrors.liters = 'Liters required';
        if (!formData.costPerLiter) newErrors.costPerLiter = 'Cost per liter required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onLog(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log Fuel Consumption" size="md">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <Select
                        label="Vehicle"
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
                        disabled={isLoading}
                    />
                    <Input
                        label="Liters"
                        type="number"
                        step="0.01"
                        value={formData.liters}
                        onChange={(e) => handleChange('liters', e.target.value)}
                        error={errors.liters}
                        disabled={isLoading}
                    />
                    <Input
                        label="Cost per Liter (₹)"
                        type="number"
                        step="0.01"
                        value={formData.costPerLiter}
                        onChange={(e) => handleChange('costPerLiter', e.target.value)}
                        error={errors.costPerLiter}
                        disabled={isLoading}
                    />
                    <Input
                        label="Odometer Current"
                        type="number"
                        value={formData.odometerAtFill}
                        onChange={(e) => handleChange('odometerAtFill', e.target.value)}
                        disabled={isLoading}
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" className={styles.submitBtn}>
                        Save Fuel Log
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
