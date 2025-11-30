import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';

export default function InputModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    fields = [],
    submitText = 'Opslaan',
    cancelText = 'Annuleren',
}) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        fields.forEach(field => {
            if (field.required && !values[field.name]) {
                newErrors[field.name] = `${field.label} is verplicht`;
            }
            if (field.type === 'number' && values[field.name] && isNaN(values[field.name])) {
                newErrors[field.name] = `${field.label} moet een getal zijn`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(values);
        setValues({});
        setErrors({});
        onClose();
    };

    const handleClose = () => {
        setValues({});
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        <Input
                            label={field.label}
                            type={field.type || 'text'}
                            value={values[field.name] || ''}
                            onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            placeholder={field.placeholder}
                            required={field.required}
                        />
                        {errors[field.name] && (
                            <p className="text-xs mt-1" style={{ color: '#FFB3BA' }}>
                                {errors[field.name]}
                            </p>
                        )}
                    </div>
                ))}

                <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        {cancelText}
                    </Button>
                    <Button type="submit" variant="primary">
                        {submitText}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
