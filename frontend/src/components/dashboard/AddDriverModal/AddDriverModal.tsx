import React, { useState } from 'react';
import { Modal } from '../../ui/Modal/Modal';
import { Input } from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import styles from './AddDriverModal.module.css';

interface AddDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (driver: any) => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        employeeId: '',
        licenseNumber: '',
        licenseExpiry: '',
        phone: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
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
        if (!formData.name) newErrors.name = 'Full name is required';
        if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
        if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        if (!formData.licenseExpiry) newErrors.licenseExpiry = 'Expiry date is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onAdd(formData);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Onboard New Driver" size="md">
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                    />
                    <Input
                        label="Employee ID"
                        placeholder="e.g. EMP-001"
                        value={formData.employeeId}
                        onChange={(e) => handleChange('employeeId', e.target.value)}
                        error={errors.employeeId}
                    />
                    <Input
                        label="License Number"
                        placeholder="e.g. MH1220220012345"
                        value={formData.licenseNumber}
                        onChange={(e) => handleChange('licenseNumber', e.target.value)}
                        error={errors.licenseNumber}
                    />
                    <Input
                        label="License Expiry"
                        type="date"
                        value={formData.licenseExpiry}
                        onChange={(e) => handleChange('licenseExpiry', e.target.value)}
                        error={errors.licenseExpiry}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" className={styles.submitBtn}>
                        Complete Onboarding
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
