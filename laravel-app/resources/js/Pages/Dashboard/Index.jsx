import { Head, Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';

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

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    Overuren Dashboard
                </h1>
                <p style={{ color: '#718096' }}>Welkom bij je persoonlijke overuren overzicht</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Saldo Card */}
                <Card className="col-span-full md:col-span-1 text-center" style={{
                    background: 'linear-gradient(135deg, #D4A5FF 0%, #B8E6D1 100%)'
                }}>
                    <h2 className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>
                        Jouw Huidige Saldo
                    </h2>
                    <div className="text-5xl font-bold my-4" style={{ color: '#2D3748' }}>
                        {saldo?.formatted || '0u 0m'}
                    </div>
                    <p className="text-sm" style={{ color: '#718096' }}>
                        Laatst bijgewerkt:{' '}
                        {saldo?.laatst_bijgewerkt
                            ? new Date(saldo.laatst_bijgewerkt).toLocaleDateString('nl-NL')
                            : '-'}
                    </p>
                </Card>

                {/* Quick Actions */}
                <Card className="col-span-full md:col-span-2">
                    <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        <Link href="/overuren" className="block">
                            <Button variant="primary" className="w-full">
                                ➕ Nieuwe Uren Invoeren
                            </Button>
                        </Link>
                        <Link href="/overuren" className="block">
                            <Button variant="secondary" className="w-full">
                                📊 Mijn Overzicht
                            </Button>
                        </Link>
                        <Link href="/saldo" className="block">
                            <Button variant="secondary" className="w-full">
                                💰 Bekijk Saldo Details
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card hover>
                    <div className="text-center">
                        <div className="text-3xl mb-2">💰</div>
                        <h3 className="font-semibold" style={{ color: '#2D3748' }}>
                            Overgedragen Saldo
                        </h3>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#D4A5FF' }}>
                            {formatMinutesToHoursMinutes(saldo?.overgedragen || 0)}
                        </p>
                    </div>
                </Card>

                <Card hover>
                    <div className="text-center">
                        <div className="text-3xl mb-2">⏱️</div>
                        <h3 className="font-semibold" style={{ color: '#2D3748' }}>
                            Dit Jaar
                        </h3>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#B8E6D1' }}>
                            {saldo?.jaar || new Date().getFullYear()}
                        </p>
                    </div>
                </Card>

                <Card hover>
                    <div className="text-center">
                        <div className="text-3xl mb-2">📈</div>
                        <h3 className="font-semibold" style={{ color: '#2D3748' }}>
                            Status
                        </h3>
                        <p className="text-2xl font-bold mt-2" style={{ color: '#BAFFC9' }}>
                            Actief
                        </p>
                    </div>
                </Card>
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="mt-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    Recente Activiteit
                </h2>
                <p className="text-center py-8" style={{ color: '#718096' }}>
                    Nog geen recente activiteit. Start met het invoeren van je overuren!
                </p>
            </Card>
        </Layout>
    );
}
