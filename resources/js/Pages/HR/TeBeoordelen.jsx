import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import ConfirmModal from '../../Components/ConfirmModal';
import InputModal from '../../Components/InputModal';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function TeBeoordelen({ indieningen }) {
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
    const [rejectModal, setRejectModal] = useState({ isOpen: false, id: null });

    const handleGoedkeuren = (id) => {
        setConfirmModal({ isOpen: true, id });
    };

    const confirmGoedkeuren = () => {
        router.post(`/hr/uren/${confirmModal.id}/goedkeuren`, {}, {
            preserveScroll: true,
        });
    };

    const handleAfkeuren = (id) => {
        setRejectModal({ isOpen: true, id });
    };

    const confirmAfkeuren = (values) => {
        router.post(`/hr/uren/${rejectModal.id}/afkeuren`, {
            reden: values.reden,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <Layout>
            <Head title="Te Beoordelen" />

            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1E293B' }}>
                    Te Beoordelen
                </h1>
                <p className="text-sm" style={{ color: '#64748B' }}>
                    Beoordeel ingediende overuren registraties
                </p>
            </div>

            <Card>
                <h2 className="text-lg font-semibold mb-6" style={{ color: '#1E293B' }}>
                    {indieningen.total || 0} indieningen
                </h2>

                {indieningen.data && indieningen.data.length > 0 ? (
                    <div className="space-y-3">
                        {indieningen.data.map((indiening) => (
                            <div
                                key={indiening.id}
                                className="p-4 rounded-lg border transition-all hover:border-slate-300"
                                style={{
                                    backgroundColor: '#FAFAFA',
                                    borderColor: '#E2E8F0',
                                }}
                            >
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-base font-semibold" style={{ color: '#1E293B' }}>
                                                {indiening.medewerker.naam}
                                            </h3>
                                            <span className="text-sm px-2 py-0.5 rounded" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                                                {indiening.medewerker.afdeling}
                                            </span>
                                            <span
                                                className="px-2 py-0.5 rounded text-xs font-medium"
                                                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                                            >
                                                INGEDIEND
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: '#94A3B8' }}>
                                                    Datum
                                                </span>
                                                <p className="text-sm font-medium" style={{ color: '#475569' }}>
                                                    {new Date(indiening.datum).toLocaleDateString('nl-NL', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: '#94A3B8' }}>
                                                    Uren
                                                </span>
                                                <p className="text-base font-semibold" style={{ color: '#1E293B' }}>
                                                    {indiening.formatted}
                                                </p>
                                            </div>
                                        </div>

                                        {indiening.reden && (
                                            <div className="p-3 rounded border mb-3" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                                                <p className="text-xs font-medium mb-1" style={{ color: '#94A3B8' }}>
                                                    Reden:
                                                </p>
                                                <p className="text-sm" style={{ color: '#475569' }}>
                                                    {indiening.reden}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex gap-4 text-xs" style={{ color: '#94A3B8' }}>
                                            <span>Week {indiening.week_nummer}, {indiening.jaar}</span>
                                            <span>•</span>
                                            <span>Ingediend: {new Date(indiening.ingediend_op).toLocaleDateString('nl-NL')}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="success"
                                            className="px-4 py-2 text-sm flex items-center gap-1.5"
                                            onClick={() => handleGoedkeuren(indiening.id)}
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                            Goedkeuren
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="px-4 py-2 text-sm flex items-center gap-1.5"
                                            onClick={() => handleAfkeuren(indiening.id)}
                                        >
                                            <XCircleIcon className="h-4 w-4" />
                                            Afkeuren
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-base font-medium mb-2" style={{ color: '#64748B' }}>
                            Alles Afgehandeld
                        </p>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                            Er zijn momenteel geen openstaande indieningen
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {indieningen.links && indieningen.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6 pt-6 border-t" style={{ borderColor: '#E2E8F0' }}>
                        {indieningen.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: link.active ? '#1E293B' : 'transparent',
                                    color: link.active ? '#FFFFFF' : '#64748B',
                                    cursor: link.url ? 'pointer' : 'not-allowed',
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={confirmGoedkeuren}
                title="Overuren Goedkeuren"
                message="Weet je zeker dat je deze overuren wilt goedkeuren? Het saldo wordt automatisch bijgewerkt."
                confirmText="Ja, Goedkeuren"
                variant="success"
            />

            <InputModal
                isOpen={rejectModal.isOpen}
                onClose={() => setRejectModal({ isOpen: false, id: null })}
                onSubmit={confirmAfkeuren}
                title="Overuren Afkeuren"
                fields={[
                    {
                        name: 'reden',
                        label: 'Reden voor afkeuring',
                        type: 'textarea',
                        placeholder: 'Geef een duidelijke reden voor de afkeuring...',
                        required: true,
                    }
                ]}
                submitText="Afkeuren"
            />
        </Layout>
    );
}
