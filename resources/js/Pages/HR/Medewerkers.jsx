import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import InputModal from '../../Components/InputModal';
import {
    MagnifyingGlassIcon,
    UserGroupIcon,
    UserIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ScaleIcon,
    ChartBarIcon,
    InboxIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Medewerkers({ medewerkers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.zoek || '');
    const [selectedAfdeling, setSelectedAfdeling] = useState(filters?.afdeling || '');
    const [saldoModal, setSaldoModal] = useState({ isOpen: false, user: null });

    // Realtime search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.zoek || '') || selectedAfdeling !== (filters?.afdeling || '')) {
                router.get('/hr/medewerkers', {
                    zoek: searchTerm,
                    afdeling: selectedAfdeling,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['medewerkers'],
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, selectedAfdeling]);

    const handleSaldoAanpassen = (values) => {
        router.post(`/hr/medewerkers/${saldoModal.user}/saldo`, {
            minuten: parseInt(values.minuten),
            reden: values.reden,
        }, {
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedAfdeling('');
        router.get('/hr/medewerkers');
    };

    const afdelingen = [...new Set(medewerkers.data?.map(m => m.afdeling).filter(Boolean))];

    return (
        <Layout>
            <Head title="Medewerkers" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
                    Medewerkers Overzicht
                </h1>
                <p style={{ color: '#718096' }}>
                    Beheer medewerkers en hun overuren saldo
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <MagnifyingGlassIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                            style={{ color: '#718096' }}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Zoek op naam, email of gebruikersnaam..."
                            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
                            style={{
                                borderColor: '#E2E8F0',
                                backgroundColor: '#F7FAFC'
                            }}
                        />
                    </div>
                    <div className="relative">
                        <BuildingOfficeIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                            style={{ color: '#718096' }}
                        />
                        <select
                            value={selectedAfdeling}
                            onChange={(e) => setSelectedAfdeling(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none transition-colors appearance-none"
                            style={{
                                borderColor: '#E2E8F0',
                                backgroundColor: '#F7FAFC'
                            }}
                        >
                            <option value="">Alle afdelingen</option>
                            {afdelingen.map(afd => (
                                <option key={afd} value={afd}>{afd}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {(searchTerm || selectedAfdeling) && (
                    <div className="mt-4 flex items-center gap-3">
                        <p className="text-sm" style={{ color: '#718096' }}>
                            Actieve filters:
                        </p>
                        {searchTerm && (
                            <span className="px-3 py-1 rounded-full text-sm flex items-center gap-2" style={{ backgroundColor: '#E2E8F0' }}>
                                Zoekterm: "{searchTerm}"
                                <button onClick={() => setSearchTerm('')}>
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </span>
                        )}
                        {selectedAfdeling && (
                            <span className="px-3 py-1 rounded-full text-sm flex items-center gap-2" style={{ backgroundColor: '#E2E8F0' }}>
                                Afdeling: {selectedAfdeling}
                                <button onClick={() => setSelectedAfdeling('')}>
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </span>
                        )}
                        <Button variant="secondary" onClick={handleReset} className="text-sm py-1">
                            Alle filters wissen
                        </Button>
                    </div>
                )}
            </Card>

            {/* Medewerkers List */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <UserGroupIcon className="h-6 w-6" style={{ color: '#D4A5FF' }} />
                    <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
                        Medewerkers ({medewerkers.total || 0})
                    </h2>
                </div>

                {medewerkers.data && medewerkers.data.length > 0 ? (
                    <div className="space-y-3">
                        {medewerkers.data.map((medewerker) => (
                            <div
                                key={medewerker.id}
                                className="p-5 rounded-lg border-2 hover:shadow-md transition-all"
                                style={{
                                    backgroundColor: '#FEFEFE',
                                    borderColor: medewerker.is_active ? '#E2E8F0' : '#FFE0E0',
                                }}
                            >
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <UserIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                            <h3 className="text-lg font-semibold" style={{ color: '#2D3748' }}>
                                                {medewerker.full_name}
                                            </h3>
                                            {!medewerker.is_active && (
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-semibold"
                                                    style={{ backgroundColor: '#FFB3BA', color: '#FFFFFF' }}
                                                >
                                                    INACTIEF
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className="flex items-center gap-2 text-sm" style={{ color: '#718096' }}>
                                                <UserIcon className="h-4 w-4" />
                                                <span>{medewerker.username}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm" style={{ color: '#718096' }}>
                                                <EnvelopeIcon className="h-4 w-4" />
                                                <span>{medewerker.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm" style={{ color: '#718096' }}>
                                                <BuildingOfficeIcon className="h-4 w-4" />
                                                <span>{medewerker.afdeling || 'Geen afdeling'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pt-2 border-t" style={{ borderColor: '#E2E8F0' }}>
                                            <div className="flex items-center gap-2">
                                                <ScaleIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                                <div>
                                                    <span className="text-xs block" style={{ color: '#718096' }}>
                                                        Huidig Saldo
                                                    </span>
                                                    <span className="text-lg font-bold" style={{
                                                        color: medewerker.huidig_saldo >= 0 ? '#10B981' : '#EF4444'
                                                    }}>
                                                        {medewerker.formatted_saldo || '0u 0m'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-5 w-5" style={{ color: '#718096' }} />
                                                <div>
                                                    <span className="text-xs block" style={{ color: '#718096' }}>
                                                        Sinds
                                                    </span>
                                                    <span className="text-sm font-medium" style={{ color: '#2D3748' }}>
                                                        {medewerker.startdatum ? new Date(medewerker.startdatum).toLocaleDateString('nl-NL') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Link href={`/hr/medewerkers/${medewerker.id}`}>
                                            <Button variant="primary" className="px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2 w-full">
                                                <ChartBarIcon className="h-4 w-4" />
                                                Details
                                            </Button>
                                        </Link>
                                        <Link href={`/hr/te-beoordelen?medewerker=${medewerker.id}`}>
                                            <Button variant="secondary" className="px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2 w-full">
                                                <InboxIcon className="h-4 w-4" />
                                                Openstaand
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            className="px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2"
                                            onClick={() => setSaldoModal({ isOpen: true, user: medewerker.id })}
                                        >
                                            <ScaleIcon className="h-4 w-4" />
                                            Saldo Aanpassen
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <UserGroupIcon className="h-16 w-16 mx-auto mb-4" style={{ color: '#E2E8F0' }} />
                        <p className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Geen medewerkers gevonden
                        </p>
                        <p className="text-sm" style={{ color: '#718096' }}>
                            Pas je zoekfilters aan om resultaten te zien
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {medewerkers.links && medewerkers.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {medewerkers.links.map((link, index) => (
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

            {/* Saldo Aanpassen Modal */}
            <InputModal
                isOpen={saldoModal.isOpen}
                onClose={() => setSaldoModal({ isOpen: false, user: null })}
                onSubmit={handleSaldoAanpassen}
                title="Saldo Aanpassen"
                fields={[
                    {
                        name: 'minuten',
                        label: 'Aantal minuten',
                        type: 'number',
                        placeholder: 'Bijv. 120 voor +2 uur, -120 voor -2 uur',
                        required: true,
                    },
                    {
                        name: 'reden',
                        label: 'Reden voor aanpassing',
                        type: 'textarea',
                        placeholder: 'Geef een duidelijke reden voor deze aanpassing...',
                        required: true,
                    }
                ]}
                submitText="Saldo Aanpassen"
            />
        </Layout>
    );
}
