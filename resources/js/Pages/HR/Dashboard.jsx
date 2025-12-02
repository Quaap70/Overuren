import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { ClockIcon, CalendarIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';
import route from 'ziggy-js';
import { Ziggy } from '../../ziggy';

export default function HRDashboard({ statistieken, recente_indieningen, jaarActies }) {
    return (
        <Layout>
            <Head title="HR Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.neutral[800] }}>
                    HR Dashboard
                </h1>
                <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                    Overzicht van alle overuren en medewerkers
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.warning[100] }}
                        >
                            <ClockIcon className="w-6 h-6" style={{ color: theme.colors.warning[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Te Beoordelen
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {statistieken?.te_beoordelen || 0}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.info[100] }}
                        >
                            <CalendarIcon className="w-6 h-6" style={{ color: theme.colors.info[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Deze Week
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {statistieken?.deze_week || 0}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.primary[100] }}
                        >
                            <UsersIcon className="w-6 h-6" style={{ color: theme.colors.primary[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Medewerkers
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {statistieken?.medewerkers || 0}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.success[100] }}
                        >
                            <ClockIcon className="w-6 h-6" style={{ color: theme.colors.success[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Totaal Uren
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {statistieken?.totaal_uren || 0}u
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Jaarbeheer acties */}
            <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                            Jaarbeheer
                        </h2>
                        {jaarActies && (
                            <p className="text-xs mt-1" style={{ color: theme.colors.neutral[500] }}>
                                Huidig jaar: {jaarActies.huidigJaar} • Vorig jaar: {jaarActies.vorigJaar}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                        {/* Waarschuwing: ingediende (niet‑goedgekeurde) overuren in vorig jaar */}
                        {jaarActies && jaarActies.pendingPrevYearCount > 0 && (
                            <div className="text-xs px-3 py-2 rounded border" style={{
                                backgroundColor: theme.colors.warning[50],
                                color: theme.colors.warning[800],
                                borderColor: theme.colors.warning[200]
                            }}>
                                Er zijn {jaarActies.pendingPrevYearCount} ingediende overuren in {jaarActies.vorigJaar} die eerst beoordeeld moeten worden.
                            </div>
                        )}

                        {/* Eén knop: Sluit vorig jaar (indien open) + Start nieuw boekjaar */}
                        {jaarActies && !jaarActies.baselineHuidigBestaat && (
                            <Button
                                variant={jaarActies.pendingPrevYearCount > 0 ? 'secondary' : 'primary'}
                                size="sm"
                                disabled={jaarActies.pendingPrevYearCount > 0}
                                title={jaarActies.pendingPrevYearCount > 0 ? 'Niet beschikbaar: er staan nog ingediende overuren open in vorig jaar' : undefined}
                                onClick={() => {
                                    if (jaarActies.pendingPrevYearCount > 0) return;
                                    // Gebruik directe URL i.p.v. Ziggy route helper om klikproblemen te voorkomen
                                    router.post('/hr/jaar/rollover', { jaar: jaarActies.huidigJaar }, { preserveScroll: true });
                                }}
                            >
                                Start nieuw boekjaar ({jaarActies.huidigJaar})
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Recent Submissions */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                        Recente Indieningen
                    </h2>
                    <Link href={route('hr.te-beoordelen', {}, false, Ziggy)}>
                        <Button variant="primary" size="sm">Alles Bekijken</Button>
                    </Link>
                </div>

                {recente_indieningen && recente_indieningen.length > 0 ? (
                    <div className="space-y-3">
                        {recente_indieningen.map((indiening) => (
                            <div
                                key={indiening.id}
                                className="flex justify-between items-center p-4 rounded-lg border transition-all"
                                style={{
                                    backgroundColor: theme.colors.neutral[50],
                                    borderColor: theme.colors.neutral[200]
                                }}
                            >
                                <div>
                                    <p className="font-bold text-sm" style={{ color: theme.colors.neutral[800] }}>
                                        {indiening.medewerker}
                                    </p>
                                    <p className="text-xs mt-1" style={{ color: theme.colors.neutral[600] }}>
                                        {new Date(indiening.datum).toLocaleDateString('nl-NL')} •{' '}
                                        {indiening.formatted}
                                    </p>
                                    {indiening.reden && (
                                        <p className="text-xs italic mt-1" style={{ color: theme.colors.neutral[500] }}>
                                            "{indiening.reden}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            router.post(route('hr.goedkeuren', { overuren: indiening.id }, false, Ziggy), {}, {
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => {
                                            const reden = prompt('Reden voor afkeuring:');
                                            if (reden) {
                                                router.post(route('hr.afkeuren', { overuren: indiening.id }, false, Ziggy), {
                                                    reden
                                                }, {
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-sm" style={{ color: theme.colors.neutral[500] }}>
                        Geen nieuwe indieningen
                    </p>
                )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Link href={route('hr.medewerkers', {}, false, Ziggy)} className="block">
                    <Button variant="primary" size="md" className="w-full">
                        <UsersIcon className="w-5 h-5 inline mr-2" />
                        Medewerkers Beheer
                    </Button>
                </Link>
                <Link href={route('hr.te-beoordelen', {}, false, Ziggy)} className="block">
                    <Button variant="secondary" size="md" className="w-full">
                        <ChartBarIcon className="w-5 h-5 inline mr-2" />
                        Te Beoordelen
                    </Button>
                </Link>
            </div>
        </Layout>
    );
}
