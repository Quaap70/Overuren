import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Toast from './Toast';
import { theme } from '../config/theme';
import {
    ClockIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import route from 'ziggy-js';
import { Ziggy } from '../ziggy';

export default function Layout({ children }) {
    const { auth } = usePage().props;
    const [ongelezen, setOngelezen] = useState(0);

    useEffect(() => {
        if (!auth.user) return;

        // Fetch initial count
        fetchOngelezen();

        // Poll every 10 seconds
        const interval = setInterval(fetchOngelezen, 10000);

        return () => clearInterval(interval);
    }, [auth.user]);

    const fetchOngelezen = async () => {
        try {
            const response = await fetch(route('notificaties.unread-count', {}, false, Ziggy), {
                headers: { 'Cache-Control': 'no-store' },
            });
            const data = await response.json();
            setOngelezen(data.count);
        } catch (error) {
            console.error('Failed to fetch unread notifications:', error);
        }
    };

    if (!auth.user) {
        return children;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
            <Toast />
            <nav className="border-b mb-8" style={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }}>
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link href={auth.user.is_hr ? route('hr.dashboard', {}, false, Ziggy) : route('dashboard', {}, false, Ziggy)} className="flex items-center gap-2">
                            <ClockIcon className="h-6 w-6" style={{ color: '#64748B' }} />
                            <h1 className="text-xl font-semibold" style={{ color: '#1E293B' }}>
                                Overuren Systeem
                            </h1>
                        </Link>

                        <div className="flex items-center gap-8">
                            {!auth.user.is_hr && (
                                <>
                                    <Link
                                        href={route('dashboard', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href={route('overuren.index', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Overuren
                                    </Link>
                                    <Link
                                        href={route('saldo.index', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Saldo
                                    </Link>
                                    <Link
                                        href={route('notificaties.index', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900 flex items-center gap-1.5 relative"
                                        style={{ color: ongelezen > 0 ? theme.colors.error[500] : theme.colors.neutral[500] }}
                                    >
                                        <BellIcon className="h-4 w-4" />
                                        Notificaties
                                        {ongelezen > 0 && (
                                            <span
                                                className="absolute -top-2 -right-3 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1"
                                                style={{
                                                    backgroundColor: theme.colors.error[500],
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                {ongelezen > 99 ? '99+' : ongelezen}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}

                            {auth.user.is_hr && (
                                <>
                                    <Link
                                        href={route('hr.dashboard', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href={route('hr.te-beoordelen', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Te Beoordelen
                                    </Link>
                                    <Link
                                        href={route('hr.medewerkers', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900"
                                        style={{ color: '#64748B' }}
                                    >
                                        Medewerkers
                                    </Link>
                                    <Link
                                        href={route('notificaties.index', {}, false, Ziggy)}
                                        className="text-sm font-medium transition-colors hover:text-slate-900 flex items-center gap-1.5 relative"
                                        style={{ color: ongelezen > 0 ? theme.colors.error[500] : theme.colors.neutral[500] }}
                                    >
                                        <BellIcon className="h-4 w-4" />
                                        Notificaties
                                        {ongelezen > 0 && (
                                            <span
                                                className="absolute -top-2 -right-3 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full px-1"
                                                style={{
                                                    backgroundColor: theme.colors.error[500],
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                {ongelezen > 99 ? '99+' : ongelezen}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}

                            <div className="flex items-center gap-4 pl-6 border-l" style={{ borderColor: '#E2E8F0' }}>
                                <div className="text-right">
                                    <p className="text-sm font-medium" style={{ color: '#1E293B' }}>
                                        {auth.user.full_name}
                                    </p>
                                    <p className="text-xs" style={{ color: '#94A3B8' }}>
                                        {auth.user.role}
                                    </p>
                                </div>
                                <Link
                                    href={route('profiel', {}, false, Ziggy)}
                                    className="p-2 rounded-lg transition-colors hover:bg-slate-100"
                                    title="Mijn Profiel"
                                >
                                    <UserCircleIcon className="h-5 w-5" style={{ color: '#64748B' }} />
                                </Link>
                                <Link
                                    href={route('logout', {}, false, Ziggy)}
                                    method="post"
                                    as="button"
                                    className="p-2 rounded-lg transition-colors hover:bg-slate-100"
                                    title="Uitloggen"
                                >
                                    <ArrowRightOnRectangleIcon className="h-5 w-5" style={{ color: '#64748B' }} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 pb-12">
                {children}
            </div>
        </div>
    );
}
