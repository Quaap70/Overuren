import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import InputModal from '../../Components/InputModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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

    const afdelingen = [...new Set(medewerkers.data?.map(m => m.afdeling).filter(Boolean))];

    return (
        <Layout>
            <Head title="Medewerkers" />

            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1E293B' }}>
                    Medewerkers
                </h1>
                <p className="text-sm" style={{ color: '#64748B' }}>
                    Beheer medewerkers en hun overuren saldo
                </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <MagnifyingGlassIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                            style={{ color: '#94A3B8' }}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Zoek op naam, email of gebruikersnaam..."
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-sm"
                            style={{
                                borderColor: '#E2E8F0',
                                backgroundColor: '#FFFFFF',
                                color: '#1E293B'
                            }}
                        />
                    </div>
                    <select
                        value={selectedAfdeling}
                        onChange={(e) => setSelectedAfdeling(e.target.value)}
                        className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-sm"
                        style={{
                            borderColor: '#E2E8F0',
                            backgroundColor: '#FFFFFF',
                            color: '#1E293B'
                        }}
                    >
                        <option value="">Alle afdelingen</option>
                        {afdelingen.map(afd => (
                            <option key={afd} value={afd}>{afd}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Medewerkers List */}
            <Card>
                <h2 className="text-lg font-semibold mb-6" style={{ color: '#1E293B' }}>
                    {medewerkers.total || 0} medewerkers
                </h2>

                {medewerkers.data && medewerkers.data.length > 0 ? (
                    <div className="space-y-3">
                        {medewerkers.data.map((medewerker) => (
                            <div
                                key={medewerker.id}
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
                                                {medewerker.full_name}
                                            </h3>
                                            {!medewerker.is_active && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
                                                >
                                                    INACTIEF
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3" style={{ color: '#64748B' }}>
                                            <span>{medewerker.username}</span>
                                            <span>{medewerker.email}</span>
                                            <span>{medewerker.afdeling || '-'}</span>
                                        </div>

                                        <div className="flex items-center gap-8 pt-3 border-t" style={{ borderColor: '#E2E8F0' }}>
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: '#94A3B8' }}>
                                                    Huidig Saldo
                                                </span>
                                                <span className="text-base font-semibold" style={{
                                                    color: medewerker.huidig_saldo >= 0 ? '#059669' : '#DC2626'
                                                }}>
                                                    {medewerker.formatted_saldo}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: '#94A3B8' }}>
                                                    In dienst sinds
                                                </span>
                                                <span className="text-sm" style={{ color: '#475569' }}>
                                                    {medewerker.startdatum ? new Date(medewerker.startdatum).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={`/hr/medewerkers/${medewerker.id}`}>
                                            <Button variant="primary" className="px-4 py-2 text-sm">
                                                Details
                                            </Button>
                                        </Link>
                                        <Link href={`/hr/te-beoordelen?medewerker=${medewerker.id}`}>
                                            <Button variant="secondary" className="px-4 py-2 text-sm">
                                                Openstaand
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            className="px-4 py-2 text-sm"
                                            onClick={() => setSaldoModal({ isOpen: true, user: medewerker.id })}
                                        >
                                            Saldo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-base font-medium mb-2" style={{ color: '#64748B' }}>
                            Geen medewerkers gevonden
                        </p>
                        <p className="text-sm" style={{ color: '#94A3B8' }}>
                            Pas je zoekfilters aan om resultaten te zien
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {medewerkers.links && medewerkers.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6 pt-6 border-t" style={{ borderColor: '#E2E8F0' }}>
                        {medewerkers.links.map((link, index) => (
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
