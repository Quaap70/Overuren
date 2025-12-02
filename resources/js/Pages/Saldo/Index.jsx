import { Head } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import { CurrencyDollarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function SaldoIndex({ saldo }) {
    const formatMinutesToHoursMinutes = (minuten) => {
        const uren = Math.floor(Math.abs(minuten) / 60);
        const mins = Math.abs(minuten) % 60;
        const sign = minuten < 0 ? '-' : '';
        return `${sign}${uren}u ${mins}m`;
    };

    return (
        <Layout>
            <Head title="Mijn Saldo" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                    Mijn Saldo
                </h1>
                <p style={{ color: '#718096' }}>Overzicht van je overuren saldo voor {saldo.jaar}</p>
            </div>

            {/* Main Saldo Card */}
            <Card className="text-center mb-6" style={{
                background: 'linear-gradient(135deg, #D4A5FF 0%, #B8E6D1 100%)'
            }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#2D3748' }}>
                    Huidig Saldo
                </h2>
                <div className="text-6xl font-bold mb-4" style={{ color: '#2D3748' }}>
                    {saldo.formatted}
                </div>
                <p className="text-sm" style={{ color: '#718096' }}>
                    Laatst bijgewerkt: {new Date(saldo.laatst_bijgewerkt).toLocaleString('nl-NL')}
                </p>
            </Card>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card hover>
                    <div className="text-center">
                        <CurrencyDollarIcon className="w-10 h-10 mx-auto mb-3" style={{ color: '#D4A5FF' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Overgedragen Saldo
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#718096' }}>
                            Van vorig jaar
                        </p>
                        <p className="text-3xl font-bold" style={{ color: '#D4A5FF' }}>
                            {formatMinutesToHoursMinutes(saldo.overgedragen)}
                        </p>
                    </div>
                </Card>

                <Card hover>
                    <div className="text-center">
                        <PlusIcon className="w-10 h-10 mx-auto mb-3" style={{ color: '#B8E6D1' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Opgebouwd Dit Jaar
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#718096' }}>
                            Goedgekeurde overuren
                        </p>
                        <p className="text-3xl font-bold" style={{ color: '#B8E6D1' }}>
                            {formatMinutesToHoursMinutes(saldo.overuren)}
                        </p>
                    </div>
                </Card>

                <Card hover>
                    <div className="text-center">
                        <MinusIcon className="w-10 h-10 mx-auto mb-3" style={{ color: '#FFB3BA' }} />
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Opgenomen
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#718096' }}>
                            Opgenomen uren
                        </p>
                        <p className="text-3xl font-bold" style={{ color: '#FFB3BA' }}>
                            {formatMinutesToHoursMinutes(saldo.opgenomen)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Info Section verwijderd op verzoek */}
        </Layout>
    );
}
