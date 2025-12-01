import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { ClockIcon, CalendarIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';

export default function HRDashboard({ statistieken, recente_indieningen }) {
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

            {/* Recent Submissions */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                        Recente Indieningen
                    </h2>
                    <Link href="/hr/te-beoordelen">
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
                                            router.post(`/hr/uren/${indiening.id}/goedkeuren`, {}, {
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
                                                router.post(`/hr/uren/${indiening.id}/afkeuren`, {
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
                <Link href="/hr/medewerkers" className="block">
                    <Button variant="primary" size="md" className="w-full">
                        <UsersIcon className="w-5 h-5 inline mr-2" />
                        Medewerkers Beheer
                    </Button>
                </Link>
                <Link href="/hr/te-beoordelen" className="block">
                    <Button variant="secondary" size="md" className="w-full">
                        <ChartBarIcon className="w-5 h-5 inline mr-2" />
                        Te Beoordelen
                    </Button>
                </Link>
            </div>
        </Layout>
    );
}
