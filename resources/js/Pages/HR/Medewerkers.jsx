import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';
import route from 'ziggy-js';
import { Ziggy } from '../../ziggy';

export default function Medewerkers({ medewerkers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.zoek || '');
    const [selectedAfdeling, setSelectedAfdeling] = useState(filters?.afdeling || '');

    // Realtime search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.zoek || '') || selectedAfdeling !== (filters?.afdeling || '')) {
                router.get(route('hr.medewerkers', {}, false, Ziggy), {
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

    const afdelingen = [...new Set(medewerkers.data?.map(m => m.afdeling).filter(Boolean))];

    return (
        <Layout>
            <Head title="Medewerkers" />

            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.neutral[800] }}>
                        Medewerkers
                    </h1>
                    <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                        Beheer medewerkers en hun overuren saldo
                    </p>
                </div>
                <Link href={route('hr.gebruikers.nieuw', {}, false, Ziggy)}>
                    <Button variant="primary" size="md">
                        <PlusIcon className="w-5 h-5 inline mr-2" />
                        Nieuwe Gebruiker
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 relative">
                        <MagnifyingGlassIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                            style={{ color: theme.colors.neutral[400] }}
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Zoek op naam, email of gebruikersnaam..."
                            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all text-sm"
                            style={{
                                borderColor: theme.colors.neutral[200],
                                backgroundColor: '#FFFFFF',
                                color: theme.colors.neutral[800],
                                height: '44px',
                            }}
                        />
                    </div>
                    <select
                        value={selectedAfdeling}
                        onChange={(e) => setSelectedAfdeling(e.target.value)}
                        className="w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-all text-sm"
                        style={{
                            borderColor: theme.colors.neutral[200],
                            backgroundColor: '#FFFFFF',
                            color: theme.colors.neutral[800],
                            height: '44px',
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
                <h2 className="text-lg font-bold mb-6" style={{ color: theme.colors.neutral[800] }}>
                    {medewerkers.total || 0} medewerkers
                </h2>

                {medewerkers.data && medewerkers.data.length > 0 ? (
                    <div className="space-y-3">
                        {medewerkers.data.map((medewerker) => (
                            <div
                                key={medewerker.id}
                                className="p-5 rounded-lg border transition-all"
                                style={{
                                    backgroundColor: theme.colors.neutral[50],
                                    borderColor: theme.colors.neutral[200],
                                }}
                            >
                                <div className="flex justify-between items-start gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-base font-bold" style={{ color: theme.colors.neutral[800] }}>
                                                {medewerker.full_name}
                                            </h3>
                                            {!medewerker.is_active && (
                                                <span
                                                    className="px-2 py-0.5 rounded text-xs font-medium"
                                                    style={{
                                                        backgroundColor: theme.colors.error[100],
                                                        color: theme.colors.error[700]
                                                    }}
                                                >
                                                    INACTIEF
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3" style={{ color: theme.colors.neutral[600] }}>
                                            <span>{medewerker.username}</span>
                                            <span>{medewerker.email}</span>
                                            <span>{medewerker.afdeling || '-'}</span>
                                        </div>

                                        <div className="flex items-center gap-8 pt-3 border-t" style={{ borderColor: theme.colors.neutral[200] }}>
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: theme.colors.neutral[500] }}>
                                                    Huidig Saldo
                                                </span>
                                                <span className="text-base font-bold" style={{
                                                    color: medewerker.huidig_saldo >= 0 ? theme.colors.success[600] : theme.colors.error[600]
                                                }}>
                                                    {medewerker.formatted_saldo}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs block mb-1" style={{ color: theme.colors.neutral[500] }}>
                                                    In dienst sinds
                                                </span>
                                                <span className="text-sm font-medium" style={{ color: theme.colors.neutral[700] }}>
                                                    {medewerker.startdatum ? new Date(medewerker.startdatum).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link href={route('hr.medewerker.detail', { user: medewerker.id }, false, Ziggy)}>
                                            <Button variant="primary" size="sm">
                                                <EyeIcon className="w-4 h-4 inline mr-1.5" />
                                                Bekijken
                                            </Button>
                                        </Link>
                                        <Link href={route('hr.gebruikers.bewerken', { user: medewerker.id }, false, Ziggy)}>
                                            <Button variant="secondary" size="sm">
                                                <PencilIcon className="w-4 h-4 inline mr-1.5" />
                                                Bewerken
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-base font-semibold mb-2" style={{ color: theme.colors.neutral[600] }}>
                            Geen medewerkers gevonden
                        </p>
                        <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                            Pas je zoekfilters aan om resultaten te zien
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {medewerkers.links && medewerkers.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6 pt-6 border-t" style={{ borderColor: theme.colors.neutral[200] }}>
                        {medewerkers.links.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className="px-3 py-1.5 rounded text-sm font-medium transition-all"
                                style={{
                                    backgroundColor: link.active ? theme.colors.neutral[800] : 'transparent',
                                    color: link.active ? '#FFFFFF' : theme.colors.neutral[600],
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
