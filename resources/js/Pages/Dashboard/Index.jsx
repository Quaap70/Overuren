import { Head, Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { PlusIcon, ChartBarIcon, CurrencyDollarIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';
import route from 'ziggy-js';
import { Ziggy } from '../../ziggy';

export default function Dashboard({ saldo }) {
    const formatMinutesToHoursMinutes = (minuten) => {
        const uren = Math.floor(Math.abs(minuten) / 60);
        const mins = Math.abs(minuten) % 60;
        const sign = minuten < 0 ? '-' : '';
        return `${sign}${uren}u ${mins}m`;
    };

    return (
        <Layout>
            <Head title="Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.neutral[800] }}>
                    Dashboard
                </h1>
                <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                    Welkom bij je persoonlijke overuren overzicht
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Saldo Card */}
                <Card className="col-span-full lg:col-span-1 text-center">
                    <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: theme.colors.primary[100] }}
                    >
                        <ClockIcon className="w-8 h-8" style={{ color: theme.colors.primary[600] }} />
                    </div>
                    <h2 className="text-sm font-medium mb-2" style={{ color: theme.colors.neutral[600] }}>
                        Huidig Saldo
                    </h2>
                    <div className="text-4xl font-bold my-3" style={{ color: theme.colors.neutral[800] }}>
                        {saldo?.formatted || '0u 0m'}
                    </div>
                    <p className="text-xs" style={{ color: theme.colors.neutral[500] }}>
                        Laatst bijgewerkt:{' '}
                        {saldo?.laatst_bijgewerkt
                            ? new Date(saldo.laatst_bijgewerkt).toLocaleDateString('nl-NL')
                            : '-'}
                    </p>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-full lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4" style={{ color: theme.colors.neutral[800] }}>
                        Snelle Acties
                    </h2>
                    <div className="space-y-3">
                        <Link href={route('overuren.index', {}, false, Ziggy)} className="block">
                            <Button variant="primary" size="md" className="w-full">
                                <PlusIcon className="w-5 h-5 inline mr-2" />
                                Nieuwe Uren Invoeren
                            </Button>
                        </Link>
                        <Link href={route('overuren.index', {}, false, Ziggy)} className="block">
                            <Button variant="secondary" size="md" className="w-full">
                                <ChartBarIcon className="w-5 h-5 inline mr-2" />
                                Mijn Overzicht
                            </Button>
                        </Link>
                        <Link href={route('saldo.index', {}, false, Ziggy)} className="block">
                            <Button variant="secondary" size="md" className="w-full">
                                <CurrencyDollarIcon className="w-5 h-5 inline mr-2" />
                                Bekijk Saldo Details
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.colors.primary[100] }}
                        >
                            <CurrencyDollarIcon className="w-6 h-6" style={{ color: theme.colors.primary[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Overgedragen Saldo
                            </h3>
                            <p className="text-xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {formatMinutesToHoursMinutes(saldo?.overgedragen || 0)}
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
                            <ClockIcon className="w-6 h-6" style={{ color: theme.colors.info[600] }} />
                        </div>
                        <div>
                            <h3 className="text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                Dit Jaar
                            </h3>
                            <p className="text-xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                {saldo?.jaar || new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
}
