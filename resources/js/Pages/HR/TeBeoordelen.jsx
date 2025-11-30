import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import ConfirmModal from '../../Components/ConfirmModal';
import InputModal from '../../Components/InputModal';
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CalendarIcon,
    UserIcon,
    BuildingOfficeIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';

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

    const getWeekLabel = (weeknummer, jaar) => {
        return `Week ${weeknummer}, ${jaar}`;
    };

    return (
        <Layout>
            <Head title="Te Beoordelen" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
                    Overuren Te Beoordelen
                </h1>
                <p style={{ color: '#718096' }}>
                    Beoordeel ingediende overuren registraties van medewerkers
                </p>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <InboxIcon className="h-6 w-6" style={{ color: '#D4A5FF' }} />
                        <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
                            Indieningen ({indieningen.total || 0})
                        </h2>
                    </div>
                </div>

                {indieningen.data && indieningen.data.length > 0 ? (
                    <div className="space-y-4">
                        {indieningen.data.map((indiening) => (
                            <div
                                key={indiening.id}
                                className="p-6 rounded-lg border-2 hover:shadow-md transition-all"
                                style={{
                                    backgroundColor: '#FEFEFE',
                                    borderColor: '#E2E8F0',
                                }}
                            >
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1 space-y-4">
                                        {/* Employee Info */}
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                            <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                                                {indiening.medewerker.naam}
                                            </h3>
                                            <div className="flex items-center gap-2 px-3 py-1 rounded-md" style={{ backgroundColor: '#F7FAFC' }}>
                                                <BuildingOfficeIcon className="h-4 w-4" style={{ color: '#718096' }} />
                                                <span className="text-sm" style={{ color: '#718096' }}>
                                                    {indiening.medewerker.afdeling}
                                                </span>
                                            </div>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: '#FFF4E6', color: '#F59E0B' }}
                                            >
                                                INGEDIEND
                                            </span>
                                        </div>

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                                                <CalendarIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                                <div>
                                                    <p className="text-xs font-medium mb-1" style={{ color: '#718096' }}>
                                                        Datum
                                                    </p>
                                                    <p className="font-semibold" style={{ color: '#2D3748' }}>
                                                        {new Date(indiening.datum).toLocaleDateString('nl-NL', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F7FAFC' }}>
                                                <ClockIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                                <div>
                                                    <p className="text-xs font-medium mb-1" style={{ color: '#718096' }}>
                                                        Aantal Uren
                                                    </p>
                                                    <p className="font-semibold text-lg" style={{ color: '#2D3748' }}>
                                                        {indiening.formatted}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        {indiening.reden && (
                                            <div className="p-4 rounded-lg border" style={{ backgroundColor: '#F7FAFC', borderColor: '#E2E8F0' }}>
                                                <p className="text-xs font-semibold mb-2" style={{ color: '#718096' }}>
                                                    Reden:
                                                </p>
                                                <p className="text-sm" style={{ color: '#2D3748' }}>
                                                    {indiening.reden}
                                                </p>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex gap-4 text-xs" style={{ color: '#718096' }}>
                                            <span>{getWeekLabel(indiening.week_nummer, indiening.jaar)}</span>
                                            <span>•</span>
                                            <span>Ingediend: {new Date(indiening.ingediend_op).toLocaleDateString('nl-NL')}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            variant="success"
                                            className="px-6 py-3 whitespace-nowrap flex items-center gap-2"
                                            onClick={() => handleGoedkeuren(indiening.id)}
                                        >
                                            <CheckCircleIcon className="h-5 w-5" />
                                            Goedkeuren
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="px-6 py-3 whitespace-nowrap flex items-center gap-2"
                                            onClick={() => handleAfkeuren(indiening.id)}
                                        >
                                            <XCircleIcon className="h-5 w-5" />
                                            Afkeuren
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <InboxIcon className="h-16 w-16 mx-auto mb-4" style={{ color: '#E2E8F0' }} />
                        <p className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Alles Afgehandeld
                        </p>
                        <p style={{ color: '#718096' }}>
                            Er zijn momenteel geen openstaande indieningen om te beoordelen.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {indieningen.links && indieningen.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {indieningen.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className="px-4 py-2 rounded-lg transition-all font-medium"
                                style={{
                                    backgroundColor: link.active ? '#BAFFC9' : '#F7FAFC',
                                    color: link.active ? '#2D3748' : '#718096',
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
                message="Weet je zeker dat je deze overuren wilt goedkeuren? Het saldo van de medewerker wordt automatisch bijgewerkt."
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
