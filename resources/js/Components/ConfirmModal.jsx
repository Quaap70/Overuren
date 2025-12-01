import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Bevestigen',
    cancelText = 'Annuleren',
    variant = 'danger',
}) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    {variant === 'danger' ? (
                        <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" style={{ color: '#FFB3BA' }} />
                    ) : (
                        <CheckCircleIcon className="h-6 w-6 flex-shrink-0" style={{ color: '#BAFFC9' }} />
                    )}
                    <p className="text-sm" style={{ color: '#2D3748' }}>
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={handleConfirm}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
