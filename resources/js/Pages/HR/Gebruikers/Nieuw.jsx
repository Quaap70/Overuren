import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../../Components/Layout';
import Card from '../../../Components/Card';
import Button from '../../../Components/Button';
import Input from '../../../Components/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { theme } from '../../../config/theme';

export default function GebruikerNieuw({ afdelingen }) {
    const [saldoEenheid, setSaldoEenheid] = useState('minuten');

    const { data, setData, post, errors, processing } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        voornaam: '',
        achternaam: '',
        role: 'MEDEWERKER',
        afdeling: '',
        startdatum: '',
        overgedragen_saldo: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Reken om naar minuten als eenheid 'uren' is
        let saldoInMinuten = parseInt(data.overgedragen_saldo) || 0;
        if (saldoEenheid === 'uren' && saldoInMinuten !== 0) {
            saldoInMinuten = saldoInMinuten * 60;
        }

        // Gebruik router.post om direct getransformeerde data te sturen
        const submitData = {
            ...data,
            overgedragen_saldo: saldoInMinuten,
        };

        router.post('/hr/gebruikers', submitData, {
            preserveState: false,
            onSuccess: () => {
                // Navigate to medewerkers page on success
            },
        });
    };

    return (
        <Layout>
            <Head title="Nieuwe Gebruiker" />

            <div className="mb-6">
                <Link href="/hr/medewerkers">
                    <Button variant="secondary">
                        <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                        Terug naar Medewerkers
                    </Button>
                </Link>
            </div>

            <Card>
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#2D3748' }}>
                    Nieuwe Gebruiker Toevoegen
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Gebruikersnaam *
                            </label>
                            <Input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                error={errors.username}
                                required
                            />
                            {errors.username && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                E-mail *
                            </label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Wachtwoord *
                            </label>
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                error={errors.password}
                                required
                            />
                            {errors.password && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.password}
                                </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: '#718096' }}>
                                Minimaal 8 tekens
                            </p>
                        </div>

                        {/* Password Confirmation */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Wachtwoord Bevestigen *
                            </label>
                            <Input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        {/* Voornaam */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Voornaam *
                            </label>
                            <Input
                                type="text"
                                value={data.voornaam}
                                onChange={(e) => setData('voornaam', e.target.value)}
                                error={errors.voornaam}
                                required
                            />
                            {errors.voornaam && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.voornaam}
                                </p>
                            )}
                        </div>

                        {/* Achternaam */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Achternaam *
                            </label>
                            <Input
                                type="text"
                                value={data.achternaam}
                                onChange={(e) => setData('achternaam', e.target.value)}
                                error={errors.achternaam}
                                required
                            />
                            {errors.achternaam && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.achternaam}
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Rol *
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="w-full px-4 py-2 rounded-md transition-all"
                                style={{
                                    border: '2px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#2D3748',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#8B5CF6';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px #EDE9FE';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                required
                            >
                                <option value="MEDEWERKER">Medewerker</option>
                                <option value="HR">HR</option>
                            </select>
                            {errors.role && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Afdeling */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Afdeling *
                            </label>
                            <select
                                value={data.afdeling}
                                onChange={(e) => setData('afdeling', e.target.value)}
                                className="w-full px-4 py-2 rounded-md transition-all"
                                style={{
                                    border: '2px solid #E2E8F0',
                                    backgroundColor: '#FFFFFF',
                                    color: '#2D3748',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#8B5CF6';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px #EDE9FE';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#E2E8F0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                required
                            >
                                <option value="">-- Selecteer afdeling --</option>
                                {afdelingen.map((afd) => (
                                    <option key={afd} value={afd}>
                                        {afd}
                                    </option>
                                ))}
                            </select>
                            {errors.afdeling && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.afdeling}
                                </p>
                            )}
                        </div>

                        {/* Startdatum */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Startdatum *
                            </label>
                            <Input
                                type="date"
                                value={data.startdatum}
                                onChange={(e) => setData('startdatum', e.target.value)}
                                error={errors.startdatum}
                                required
                            />
                            {errors.startdatum && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.startdatum}
                                </p>
                            )}
                        </div>

                        {/* Overgedragen Saldo */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                Overgedragen Saldo
                            </label>
                            <div className="flex gap-2 items-start">
                                <div style={{ flex: '1' }}>
                                    <Input
                                        type="number"
                                        value={data.overgedragen_saldo}
                                        onChange={(e) => setData('overgedragen_saldo', e.target.value)}
                                        error={errors.overgedragen_saldo}
                                        placeholder={saldoEenheid === 'uren' ? 'Bijv. 8' : 'Bijv. 480'}
                                        step={saldoEenheid === 'uren' ? '0.5' : '5'}
                                    />
                                </div>
                                <div style={{ width: '140px', paddingTop: '28px' }}>
                                    <select
                                        value={saldoEenheid}
                                        onChange={(e) => setSaldoEenheid(e.target.value)}
                                        className="w-full transition-all"
                                        style={{
                                            border: `2px solid ${theme.colors.neutral[200]}`,
                                            backgroundColor: '#FFFFFF',
                                            color: theme.colors.neutral[800],
                                            outline: 'none',
                                            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                                            fontSize: theme.typography.fontSize.sm,
                                            borderRadius: theme.borderRadius.md,
                                            boxSizing: 'border-box',
                                            height: '42px',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = theme.colors.primary[500];
                                            e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary[100]}`;
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = theme.colors.neutral[200];
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="minuten">Minuten</option>
                                        <option value="uren">Uren</option>
                                    </select>
                                </div>
                            </div>
                            {errors.overgedragen_saldo && (
                                <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                    {errors.overgedragen_saldo}
                                </p>
                            )}
                            <p className="text-xs mt-1" style={{ color: '#718096' }}>
                                Stel het beginsaldo in voor bestaande overuren (optioneel)
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                        <Button type="submit" disabled={processing}>
                            Gebruiker Toevoegen
                        </Button>
                        <Link href="/hr/medewerkers">
                            <Button type="button" variant="secondary">
                                Annuleren
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </Layout>
    );
}
