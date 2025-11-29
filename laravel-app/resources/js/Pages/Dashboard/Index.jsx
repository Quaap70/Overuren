import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
                <nav className="shadow-md p-4 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                            🕐 Overuren Systeem
                        </h1>
                        <div className="flex items-center gap-4">
                            <span style={{ color: '#718096' }}>
                                {auth.user.full_name} ({auth.user.role})
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="px-4 py-2 rounded-lg"
                                style={{ backgroundColor: '#FFD3BA', color: '#2D3748' }}
                            >
                                Uitloggen
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: '#2D3748' }}>
                            Welkom, {auth.user.voornaam}! 👋
                        </h2>
                        <p className="mb-6" style={{ color: '#718096' }}>
                            Dit is je dashboard waar je straks je overuren kunt registreren en beheren.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 rounded-lg" style={{ backgroundColor: '#B8E6D1' }}>
                                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                                    Mijn Overuren
                                </h3>
                                <p style={{ color: '#718096' }}>Binnenkort beschikbaar</p>
                            </div>

                            <div className="p-6 rounded-lg" style={{ backgroundColor: '#FFD3BA' }}>
                                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                                    Mijn Saldo
                                </h3>
                                <p style={{ color: '#718096' }}>Binnenkort beschikbaar</p>
                            </div>

                            <div className="p-6 rounded-lg" style={{ backgroundColor: '#D4A5FF' }}>
                                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D3748' }}>
                                    Notificaties
                                </h3>
                                <p style={{ color: '#718096' }}>Binnenkort beschikbaar</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
