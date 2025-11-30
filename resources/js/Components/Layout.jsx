import { Link, usePage } from '@inertiajs/react';
import Toast from './Toast';
import {
    ClockIcon,
    BellIcon,
    HomeIcon,
    DocumentTextIcon,
    ScaleIcon,
    InboxIcon,
    UserGroupIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

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
                        <div className="flex items-center gap-3">
                            <ClockIcon className="h-8 w-8" style={{ color: '#D4A5FF' }} />
                            <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                                Overuren Systeem
                            </h1>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6">
                        {!auth.user.is_hr && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <HomeIcon className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/overuren"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    Mijn Overuren
                                </Link>
                                <Link
                                    href="/saldo"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <ScaleIcon className="h-5 w-5" />
                                    Mijn Saldo
                                </Link>
                                <Link
                                    href="/notificaties"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <BellIcon className="h-5 w-5" />
                                    Notificaties
                                </Link>
                            </>
                        )}

                        {auth.user.is_hr && (
                            <>
                                <Link
                                    href="/hr/dashboard"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <HomeIcon className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/hr/te-beoordelen"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <InboxIcon className="h-5 w-5" />
                                    Te Beoordelen
                                </Link>
                                <Link
                                    href="/hr/medewerkers"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <UserGroupIcon className="h-5 w-5" />
                                    Medewerkers
                                </Link>
                                <Link
                                    href="/notificaties"
                                    className="flex items-center gap-2 hover:opacity-75 transition-opacity font-medium"
                                    style={{ color: '#718096' }}
                                >
                                    <BellIcon className="h-5 w-5" />
                                    Notificaties
                                </Link>
                            </>
                        )}

                        <div className="border-l pl-6" style={{ borderColor: '#E2E8F0' }}>
                            <span className="text-sm font-medium" style={{ color: '#718096' }}>
                                {auth.user.full_name}
                            </span>
                            <span className="ml-2 px-2 py-1 rounded text-xs font-semibold" style={{
                                backgroundColor: auth.user.is_hr ? '#D4A5FF' : '#BAFFC9',
                                color: '#2D3748'
                            }}>
                                {auth.user.role}
                            </span>
                        </div>

                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105 font-medium"
                            style={{ backgroundColor: '#FFD3BA', color: '#2D3748' }}
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Uitloggen
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 pb-8">
                {children}
            </div>
        </div>
    );
}
