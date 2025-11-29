import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import Input from '../../Components/Input';

export default function Medewerkers({ medewerkers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedAfdeling, setSelectedAfdeling] = useState(filters?.afdeling || '');

    const formatMinutesToHoursMinutes = (minuten) => {
        const uren = Math.floor(Math.abs(minuten) / 60);
        const mins = Math.abs(minuten) % 60;
        const sign = minuten < 0 ? '-' : '';
        return `${sign}${uren}u ${mins}m`;
    };

    const handleSearch = () => {
        router.get('/hr/medewerkers', {
            search: searchTerm,
            afdeling: selectedAfdeling,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSaldoAanpassen = (userId) => {
        const minuten = prompt('Aantal minuten om aan te passen (positief of negatief):');
        const reden = prompt('Reden voor aanpassing:');

        if (minuten && reden) {
            router.post(`/hr/medewerkers/${userId}/saldo`, {
                minuten: parseInt(minuten),
                reden,
            }, {
                preserveScroll: true,
            });
        }
    };

    const afdelingen = [...new Set(medewerkers.data?.map(m => m.afdeling).filter(Boolean))];

    return (
        <Layout>
            <Head title="Medewerkers" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    Medewerkers Overzicht
                </h1>
                <p style={{ color: '#718096' }}>Beheer medewerkers en hun overuren saldo</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Zoeken"
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Zoek op naam, email of gebruikersnaam..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                            Afdeling
                        </label>
                        <select
                            value={selectedAfdeling}
                            onChange={(e) => setSelectedAfdeling(e.target.value)}
                            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors"
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
                <div className="mt-4 flex gap-3">
                    <Button variant="primary" onClick={handleSearch}>
                        🔍 Zoeken
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedAfdeling('');
                            router.get('/hr/medewerkers');
                        }}
                    >
                        ✕ Reset
                    </Button>
                </div>
            </Card>

            {/* Medewerkers List */}
            <Card>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    Medewerkers ({medewerkers.total || 0})
                </h2>

                {medewerkers.data && medewerkers.data.length > 0 ? (
                    <div className="space-y-3">
                        {medewerkers.data.map((medewerker) => (
                            <div
                                key={medewerker.id}
                                className="p-4 rounded-lg border-2 hover:border-opacity-100 transition-all"
                                style={{
                                    backgroundColor: '#F7FAFC',
                                    borderColor: medewerker.is_active ? '#E2E8F0' : '#FFB3BA',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold" style={{ color: '#2D3748' }}>
                                                {medewerker.full_name}
                                            </h3>
                                            {!medewerker.is_active && (
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-semibold"
                                                    style={{ backgroundColor: '#FFB3BA', color: '#2D3748' }}
                                                >
                                                    INACTIEF
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm" style={{ color: '#718096' }}>
                                            <p>👤 {medewerker.username}</p>
                                            <p>📧 {medewerker.email}</p>
                                            <p>🏢 {medewerker.afdeling || 'Geen afdeling'}</p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-4">
                                            <div>
                                                <span className="text-xs" style={{ color: '#718096' }}>
                                                    Huidig Saldo:
                                                </span>
                                                <span className="ml-2 text-lg font-bold" style={{
                                                    color: medewerker.huidig_saldo >= 0 ? '#B8E6D1' : '#FFB3BA'
                                                }}>
                                                    {medewerker.formatted_saldo || '0u 0m'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs" style={{ color: '#718096' }}>
                                                    Sinds:
                                                </span>
                                                <span className="ml-2 text-sm" style={{ color: '#2D3748' }}>
                                                    {medewerker.startdatum ? new Date(medewerker.startdatum).toLocaleDateString('nl-NL') : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Link href={`/hr/medewerkers/${medewerker.id}`}>
                                            <Button variant="primary" className="px-4 py-2 text-sm whitespace-nowrap">
                                                📊 Details
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            className="px-4 py-2 text-sm whitespace-nowrap"
                                            onClick={() => handleSaldoAanpassen(medewerker.id)}
                                        >
                                            ⚙️ Saldo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8" style={{ color: '#718096' }}>
                        Geen medewerkers gevonden
                    </p>
                )}

                {/* Pagination */}
                {medewerkers.links && medewerkers.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {medewerkers.links.map((link, index) => (
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
