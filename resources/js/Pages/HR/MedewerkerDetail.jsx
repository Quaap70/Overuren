import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';

export default function MedewerkerDetail({ medewerker, recente_overuren, saldo }) {
    const formatMinutesToHoursMinutes = (minuten) => {
        const uren = Math.floor(Math.abs(minuten) / 60);
        const mins = Math.abs(minuten) % 60;
        const sign = minuten < 0 ? '-' : '';
        return `${sign}${uren}u ${mins}m`;
    };

    const getStatusBadgeStyle = (status) => {
        const styles = {
            CONCEPT: { backgroundColor: '#718096', color: '#FFFFFF' },
            INGEDIEND: { backgroundColor: '#D4A5FF', color: '#2D3748' },
            GOEDGEKEURD: { backgroundColor: '#BAFFC9', color: '#2D3748' },
            AFGEKEURD: { backgroundColor: '#FFB3BA', color: '#2D3748' },
        };
        return styles[status] || styles.CONCEPT;
    };

    const handleSaldoAanpassen = () => {
        const minuten = prompt('Aantal minuten om aan te passen (positief of negatief):');
        const reden = prompt('Reden voor aanpassing:');

        if (minuten && reden) {
            router.post(`/hr/medewerkers/${medewerker.id}/saldo`, {
                minuten: parseInt(minuten),
                reden,
            }, {
                preserveScroll: true,
            });
        }
    };

    return (
        <Layout>
            <Head title={`Medewerker: ${medewerker.full_name}`} />

            {/* Header */}
            <div className="mb-6">
                <Link href="/hr/medewerkers">
                    <Button variant="secondary" className="mb-4">
                        ← Terug naar Medewerkers
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    {medewerker.full_name}
                </h1>
                <p style={{ color: '#718096' }}>{medewerker.email}</p>
            </div>

            {/* Employee Info Card */}
            <Card className="mb-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    Medewerker Informatie
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Gebruikersnaam
                            </p>
                            <p className="text-lg" style={{ color: '#2D3748' }}>
                                {medewerker.username}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Email
                            </p>
                            <p className="text-lg" style={{ color: '#2D3748' }}>
                                {medewerker.email}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Rol
                            </p>
                            <p className="text-lg" style={{ color: '#2D3748' }}>
                                {medewerker.role}
                            </p>
                        </div>
                    </div>
                    <div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Afdeling
                            </p>
                            <p className="text-lg" style={{ color: '#2D3748' }}>
                                {medewerker.afdeling || 'Geen afdeling'}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Startdatum
                            </p>
                            <p className="text-lg" style={{ color: '#2D3748' }}>
                                {medewerker.startdatum
                                    ? new Date(medewerker.startdatum).toLocaleDateString('nl-NL')
                                    : '-'}
                            </p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm font-semibold" style={{ color: '#718096' }}>
                                Status
                            </p>
                            <span
                                className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                                style={{
                                    backgroundColor: medewerker.is_active ? '#BAFFC9' : '#FFB3BA',
                                    color: '#2D3748'
                                }}
                            >
                                {medewerker.is_active ? 'ACTIEF' : 'INACTIEF'}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Saldo Card */}
            <Card className="mb-6" style={{
                background: 'linear-gradient(135deg, #D4A5FF 0%, #B8E6D1 100%)'
            }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold mb-2" style={{ color: '#2D3748' }}>
                            Huidig Saldo ({saldo?.jaar || new Date().getFullYear()})
                        </h2>
                        <div className="text-4xl font-bold mb-2" style={{ color: '#2D3748' }}>
                            {saldo?.formatted || '0u 0m'}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm" style={{ color: '#2D3748' }}>
                            <div>
                                <p className="font-semibold">Overgedragen</p>
                                <p>{formatMinutesToHoursMinutes(saldo?.overgedragen || 0)}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Gebruikt</p>
                                <p>{formatMinutesToHoursMinutes(saldo?.gebruikt || 0)}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Laatst Bijgewerkt</p>
                                <p>{saldo?.laatst_bijgewerkt
                                    ? new Date(saldo.laatst_bijgewerkt).toLocaleDateString('nl-NL')
                                    : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleSaldoAanpassen}
                        className="whitespace-nowrap"
                    >
                        ⚙️ Saldo Aanpassen
                    </Button>
                </div>
            </Card>

            {/* Recent Overtime */}
            <Card>
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    Recente Overuren Registraties
                </h2>

                {recente_overuren && recente_overuren.length > 0 ? (
                    <div className="space-y-3">
                        {recente_overuren.map((uur) => (
                            <div
                                key={uur.id}
                                className="p-4 rounded-lg border-2"
                                style={{
                                    backgroundColor: '#F7FAFC',
                                    borderColor: '#E2E8F0',
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold" style={{ color: '#2D3748' }}>
                                                {new Date(uur.datum).toLocaleDateString('nl-NL', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-semibold"
                                                style={getStatusBadgeStyle(uur.status)}
                                            >
                                                {uur.status}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold mb-1" style={{ color: '#2D3748' }}>
                                            {uur.formatted_time}
                                        </p>
                                        {uur.reden && (
                                            <p className="text-sm italic" style={{ color: '#718096' }}>
                                                "{uur.reden}"
                                            </p>
                                        )}
                                        {uur.afkeur_reden && (
                                            <p className="text-sm mt-2 p-2 rounded" style={{
                                                backgroundColor: '#FFB3BA',
                                                color: '#2D3748'
                                            }}>
                                                Afkeur reden: {uur.afkeur_reden}
                                            </p>
                                        )}
                                        <p className="text-xs mt-2" style={{ color: '#718096' }}>
                                            Week {uur.week_nummer} • Jaar {uur.jaar}
                                            {uur.goedgekeurd_op && ` • Goedgekeurd: ${new Date(uur.goedgekeurd_op).toLocaleDateString('nl-NL')}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8" style={{ color: '#718096' }}>
                        Nog geen overuren geregistreerd
                    </p>
                )}
            </Card>
        </Layout>
    );
}
