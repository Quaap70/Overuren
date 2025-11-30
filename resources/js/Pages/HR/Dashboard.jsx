import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { ClockIcon, CalendarIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function HRDashboard({ statistieken, recente_indieningen }) {
    return (
        <Layout>
            <Head title="HR Dashboard" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    HR Dashboard
                </h1>
                <p style={{ color: '#718096' }}>Overzicht van alle overuren en medewerkers</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card hover className="text-center">
                    <ClockIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#D4A5FF' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Te Beoordelen
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#D4A5FF' }}>
                        {statistieken?.te_beoordelen || 0}
                    </p>
                </Card>

                <Card hover className="text-center">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#B8E6D1' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Deze Week
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#B8E6D1' }}>
                        {statistieken?.deze_week || 0}
                    </p>
                </Card>

                <Card hover className="text-center">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#FFD3BA' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Medewerkers
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#FFD3BA' }}>
                        {statistieken?.medewerkers || 0}
                    </p>
                </Card>

                <Card hover className="text-center">
                    <ClockIcon className="w-8 h-8 mx-auto mb-2" style={{ color: '#D4A5FF' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#718096' }}>
                        Totaal Uren
                    </h3>
                    <p className="text-3xl font-bold mt-2" style={{ color: '#D4A5FF' }}>
                        {statistieken?.totaal_uren || 0}u
                    </p>
                </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
                        Recente Indieningen
                    </h2>
                    <Link href="/hr/te-beoordelen">
                        <Button variant="primary">Alles Bekijken</Button>
                    </Link>
                </div>

                {recente_indieningen && recente_indieningen.length > 0 ? (
                    <div className="space-y-3">
                        {recente_indieningen.map((indiening) => (
                            <div
                                key={indiening.id}
                                className="flex justify-between items-center p-4 rounded-lg transition-colors hover:bg-opacity-70"
                                style={{ backgroundColor: '#F0F4F8' }}
                            >
                                <div>
                                    <p className="font-semibold" style={{ color: '#2D3748' }}>
                                        {indiening.medewerker}
                                    </p>
                                    <p className="text-sm" style={{ color: '#718096' }}>
                                        {new Date(indiening.datum).toLocaleDateString('nl-NL')} -{' '}
                                        {indiening.formatted}
                                    </p>
                                    {indiening.reden && (
                                        <p className="text-sm italic mt-1" style={{ color: '#718096' }}>
                                            "{indiening.reden}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="success"
                                        className="px-4 py-2"
                                        onClick={() => {
                                            router.post(`/hr/uren/${indiening.id}/goedkeuren`, {}, {
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="px-4 py-2"
                                        onClick={() => {
                                            const reden = prompt('Reden voor afkeuring:');
                                            if (reden) {
                                                router.post(`/hr/uren/${indiening.id}/afkeuren`, {
                                                    reden
                                                }, {
                                                    preserveScroll: true,
                                                });
                                            }
                                        }}
                                    >
                                        <XCircleIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8" style={{ color: '#718096' }}>
                        Geen nieuwe indieningen
                    </p>
                )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Link href="/hr/medewerkers" className="block">
                    <Button variant="primary" className="w-full py-4">
                        <UsersIcon className="w-5 h-5 inline mr-2" /> Medewerkers Beheer
                    </Button>
                </Link>
                <Link href="/hr/te-beoordelen" className="block">
                    <Button variant="secondary" className="w-full py-4">
                        <ChartBarIcon className="w-5 h-5 inline mr-2" /> Te Beoordelen
                    </Button>
                </Link>
                <Button variant="secondary" className="w-full py-4">
                    <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" /> Export naar Excel
                </Button>
            </div>
        </Layout>
    );
}
