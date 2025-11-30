import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div
                    className={`relative w-full ${sizes[size]} rounded-lg shadow-xl transition-all`}
                    style={{ backgroundColor: '#FFFFFF' }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-6 py-4 border-b"
                        style={{ borderColor: '#E2E8F0' }}
                    >
                        <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" style={{ color: '#718096' }} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
