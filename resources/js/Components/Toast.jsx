import React from 'react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (flash.success || flash.error || flash.info) {
            const type = flash.success ? 'success' : flash.error ? 'error' : 'info';
            const text = flash.success || flash.error || flash.info;

            setMessage({ type, text });
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || !message) return null;

    const getStyles = () => {
        const styles = {
            success: {
                backgroundColor: '#BAFFC9',
                borderColor: '#B8E6D1',
                Icon: CheckCircleIcon,
            },
            error: {
                backgroundColor: '#FFB3BA',
                borderColor: '#FFB3BA',
                Icon: XCircleIcon,
            },
            info: {
                backgroundColor: '#D4A5FF',
                borderColor: '#D4A5FF',
                Icon: InformationCircleIcon,
            },
        };
        return styles[message.type];
    };

    const styles = getStyles();

    return (
        <div
            className="fixed top-4 right-4 z-50 max-w-md animate-fade-in-down"
            style={{
                animation: visible ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in',
            }}
        >
            <div
                className="flex items-center gap-3 p-4 rounded-lg shadow-lg border-2"
                style={{
                    backgroundColor: styles.backgroundColor,
                    borderColor: styles.borderColor,
                    color: '#2D3748',
                }}
            >
                <styles.Icon className="w-6 h-6 flex-shrink-0" style={{ color: '#2D3748' }} />
                <p className="flex-1 font-medium">{message.text}</p>
                <button
                    onClick={() => setVisible(false)}
                    className="text-2xl hover:opacity-75 transition-opacity"
                    style={{ color: '#2D3748' }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
