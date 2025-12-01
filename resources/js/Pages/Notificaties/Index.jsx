import React from 'react';
import { Head, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { CheckCircleIcon, XCircleIcon, CogIcon, BellIcon, InformationCircleIcon, InboxIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function NotificatiesIndex({ notificaties, ongelezen_count }) {
    const getTypeIcon = (type) => {
        const icons = {
            GOEDKEURING: CheckCircleIcon,
            AFKEURING: XCircleIcon,
            SALDO_WIJZIGING: CogIcon,
            HERINNERING: BellIcon,
            INFO: InformationCircleIcon,
        };
        return icons[type] || InformationCircleIcon;
    };

    const getTypeColor = (type) => {
        const colors = {
            GOEDKEURING: '#BAFFC9',
            AFKEURING: '#FFB3BA',
            SALDO_WIJZIGING: '#D4A5FF',
            HERINNERING: '#FFD3BA',
            INFO: '#B8E6D1',
        };
        return colors[type] || '#E2E8F0';
    };

    const markAsRead = (notificatieId) => {
        router.post(`/notificaties/${notificatieId}/gelezen`, {}, {
            preserveScroll: true,
        });
    };

    const markAllAsRead = () => {
        if (confirm('Wil je alle notificaties als gelezen markeren?')) {
            router.post('/notificaties/alles-gelezen', {}, {
                preserveScroll: true,
            });
        }
    };

    const deleteNotificatie = (notificatieId) => {
        if (confirm('Weet je zeker dat je deze notificatie wilt verwijderen?')) {
            router.delete(`/notificaties/${notificatieId}`, {
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Zojuist';
        if (diffMins < 60) return `${diffMins} minuten geleden`;
        if (diffHours < 24) return `${diffHours} uur geleden`;
        if (diffDays === 1) return 'Gisteren';
        if (diffDays < 7) return `${diffDays} dagen geleden`;

        return date.toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <Layout>
            <Head title="Notificaties" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                        Notificaties
                    </h1>
                    <p style={{ color: '#718096' }}>
                        {ongelezen_count > 0
                            ? `Je hebt ${ongelezen_count} ongelezen notificatie${ongelezen_count !== 1 ? 's' : ''}`
                            : 'Alle notificaties zijn gelezen'}
                    </p>
                </div>
                {ongelezen_count > 0 && (
                    <Button variant="secondary" onClick={markAllAsRead}>
                        <CheckIcon className="w-4 h-4 inline mr-1" /> Alles Gelezen
                    </Button>
                )}
            </div>

            <Card>
                {notificaties.data && notificaties.data.length > 0 ? (
                    <div className="space-y-3">
                        {notificaties.data.map((notificatie) => (
                            <div
                                key={notificatie.id}
                                className="p-4 rounded-lg border-2 transition-all"
                                style={{
                                    backgroundColor: notificatie.gelezen ? '#F7FAFC' : '#FFFFFF',
                                    borderColor: notificatie.gelezen ? '#E2E8F0' : getTypeColor(notificatie.type),
                                    opacity: notificatie.gelezen ? 0.7 : 1,
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {(() => {
                                                const IconComponent = getTypeIcon(notificatie.type);
                                                return <IconComponent className="w-6 h-6 flex-shrink-0" style={{ color: '#2D3748' }} />;
                                            })()}
                                            <div className="flex-1">
                                                <h3 className="font-bold" style={{ color: '#2D3748' }}>
                                                    {notificatie.titel}
                                                </h3>
                                                <p className="text-xs" style={{ color: '#718096' }}>
                                                    {formatDate(notificatie.created_at)}
                                                </p>
                                            </div>
                                            {!notificatie.gelezen && (
                                                <span
                                                    className="px-2 py-1 rounded-full text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: '#D4A5FF',
                                                        color: '#2D3748'
                                                    }}
                                                >
                                                    NIEUW
                                                </span>
                                            )}
                                        </div>
                                        <p className="mb-3" style={{ color: '#2D3748' }}>
                                            {notificatie.bericht}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {!notificatie.gelezen && (
                                            <Button
                                                variant="success"
                                                className="px-3 py-1 text-sm"
                                                onClick={() => markAsRead(notificatie.id)}
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="danger"
                                            className="px-3 py-1 text-sm"
                                            onClick={() => deleteNotificatie(notificatie.id)}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <InboxIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#718096' }} />
                        <p className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Geen Notificaties
                        </p>
                        <p style={{ color: '#718096' }}>
                            Je hebt nog geen notificaties ontvangen
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {notificaties.links && notificaties.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {notificaties.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className="px-4 py-2 rounded-lg transition-all"
                                style={{
                                    backgroundColor: link.active ? '#B8E6D1' : '#E2E8F0',
                                    color: link.active ? '#2D3748' : '#718096',
                                    cursor: link.url ? 'pointer' : 'not-allowed',
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </Card>
        </Layout>
    );
}
