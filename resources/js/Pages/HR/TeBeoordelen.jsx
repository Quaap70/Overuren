import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';

export default function TeBeoordelen({ indieningen, filters }) {
    const [afkeurReden, setAfkeurReden] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const handleGoedkeuren = (id) => {
        if (confirm('Weet je zeker dat je deze registratie wilt goedkeuren?')) {
            router.post(`/hr/uren/${id}/goedkeuren`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleAfkeuren = (id) => {
        const reden = prompt('Reden voor afkeuring:');
        if (reden) {
            router.post(`/hr/uren/${id}/afkeuren`, {
                reden,
            }, {
                preserveScroll: true,
            });
        }
    };

    const getWeekLabel = (weeknummer, jaar) => {
        return `Week ${weeknummer}, ${jaar}`;
    };

    return (
        <Layout>
            <Head title="Te Beoordelen" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    Overuren Te Beoordelen
                </h1>
                <p style={{ color: '#718096' }}>
                    Beoordeel ingediende overuren registraties
                </p>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
                        Indieningen ({indieningen.total || 0})
                    </h2>
                </div>

                {indieningen.data && indieningen.data.length > 0 ? (
                    <div className="space-y-4">
                        {indieningen.data.map((indiening) => (
                            <div
                                key={indiening.id}
                                className="p-5 rounded-lg border-2 hover:shadow-lg transition-all"
                                style={{
                                    backgroundColor: '#F7FAFC',
                                    borderColor: '#D4A5FF',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        {/* Employee Info */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-bold" style={{ color: '#2D3748' }}>
                                                {indiening.medewerker.naam}
                                            </h3>
                                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E2E8F0', color: '#718096' }}>
                                                {indiening.medewerker.afdeling}
                                            </span>
                                            <span
                                                className="px-3 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: '#D4A5FF', color: '#2D3748' }}
                                            >
                                                INGEDIEND
                                            </span>
                                        </div>

                                        {/* Date and Time */}
                                        <div className="mb-3">
                                            <p className="text-sm" style={{ color: '#718096' }}>
                                                📅 {new Date(indiening.datum).toLocaleDateString('nl-NL', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-2xl font-bold mt-1" style={{ color: '#2D3748' }}>
                                                ⏱️ {indiening.formatted}
                                            </p>
                                        </div>

                                        {/* Reason */}
                                        {indiening.reden && (
                                            <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                                                <p className="text-xs font-semibold mb-1" style={{ color: '#718096' }}>
                                                    Reden:
                                                </p>
                                                <p className="italic" style={{ color: '#2D3748' }}>
                                                    "{indiening.reden}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex gap-4 text-xs" style={{ color: '#718096' }}>
                                            <span>📊 {getWeekLabel(indiening.week_nummer, indiening.jaar)}</span>
                                            <span>📤 Ingediend: {new Date(indiening.ingediend_op).toLocaleDateString('nl-NL')}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 ml-4">
                                        <Button
                                            variant="success"
                                            className="px-6 py-3 whitespace-nowrap"
                                            onClick={() => handleGoedkeuren(indiening.id)}
                                        >
                                            ✅ Goedkeuren
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="px-6 py-3 whitespace-nowrap"
                                            onClick={() => handleAfkeuren(indiening.id)}
                                        >
                                            ❌ Afkeuren
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Alles Afgehandeld!
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card hover className="text-center">
                    <div className="text-3xl mb-2">⏳</div>
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Te Beoordelen
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#D4A5FF' }}>
                        {indieningen.total || 0}
                    </p>
                </Card>

                <Card hover className="text-center">
                    <div className="text-3xl mb-2">✅</div>
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Deze Week Goedgekeurd
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#BAFFC9' }}>
                        -
                    </p>
                </Card>

                <Card hover className="text-center">
                    <div className="text-3xl mb-2">❌</div>
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Deze Week Afgekeurd
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#FFB3BA' }}>
                        -
                    </p>
                </Card>
            </div>
        </Layout>
    );
}
