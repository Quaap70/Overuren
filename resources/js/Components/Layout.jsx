import { Link, usePage } from '@inertiajs/react';
import Toast from './Toast';

export default function Layout({ children }) {
    const { auth } = usePage().props;

    if (!auth.user) {
        return children;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F0F4F8' }}>
            <Toast />
            <nav className="shadow-md p-4 mb-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="container mx-auto flex justify-between items-center">
                    <Link href={auth.user.is_hr ? '/hr/dashboard' : '/dashboard'}>
                        <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                            🕐 Overuren Systeem
                        </h1>
                    </Link>

                    <div className="flex items-center gap-6">
                        {!auth.user.is_hr && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/overuren"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Mijn Overuren
                                </Link>
                                <Link
                                    href="/saldo"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Mijn Saldo
                                </Link>
                                <Link
                                    href="/notificaties"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    🔔 Notificaties
                                </Link>
                            </>
                        )}

                        {auth.user.is_hr && (
                            <>
                                <Link
                                    href="/hr/dashboard"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/hr/te-beoordelen"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Te Beoordelen
                                </Link>
                                <Link
                                    href="/hr/medewerkers"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    Medewerkers
                                </Link>
                                <Link
                                    href="/notificaties"
                                    className="hover:opacity-75 transition-opacity"
                                    style={{ color: '#718096' }}
                                >
                                    🔔 Notificaties
                                </Link>
                            </>
                        )}

                        <div className="border-l pl-6" style={{ borderColor: '#E2E8F0' }}>
                            <span style={{ color: '#718096' }}>
                                {auth.user.full_name} ({auth.user.role})
                            </span>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="px-4 py-2 rounded-lg transition-all hover:scale-105"
                            style={{ backgroundColor: '#FFD3BA', color: '#2D3748' }}
                        >
                            Uitloggen
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4">
                {children}
            </div>
        </div>
    );
}
