import {Head, Link} from '@inertiajs/react';
import Layout from '../../Components/Layout';
import Card from '../../Components/Card';
import Button from '../../Components/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import {theme} from '../../config/theme';
import route from 'ziggy-js';
import {Ziggy} from '../../ziggy';
import MonthCalendar from '../../Components/MonthCalendar';

export default function Dashboard({saldo, calendar}) {

    return (
        <Layout>
            <Head title="Dashboard"/>

            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{color: theme.colors.neutral[800]}}>
                    Dashboard
                </h1>
                <p className="text-sm" style={{color: theme.colors.neutral[500]}}>
                    Welkom bij je persoonlijke overuren overzicht
                </p>
            </div>

            <div className="flex flex-col gap-6">

                <Card className="col-span-full lg:col-span-2">
                    <h2 className="text-lg font-bold mb-4" style={{color: theme.colors.neutral[800]}}>
                        Maandkalender
                    </h2>
                    <MonthCalendar data={calendar} basePath="/dashboard"/>
                </Card>

                <Link href={route('overuren.index', {}, false, Ziggy)} className="block">
                    <Button variant="primary" size="md" className="w-full">
                        <PlusIcon className="w-5 h-5 inline mr-2"/>
                        Nieuwe Uren Invoeren
                    </Button>
                </Link>

            </div>
        </Layout>
    );
}
