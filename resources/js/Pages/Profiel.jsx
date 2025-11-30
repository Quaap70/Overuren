import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../Components/Layout';
import Card from '../Components/Card';
import Button from '../Components/Button';
import Input from '../Components/Input';
import { UserIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function Profiel({ user }) {
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.post('/profiel/wachtwoord', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowPasswordForm(false);
            },
        });
    };

    return (
        <Layout>
            <Head title="Mijn Profiel" />

            <div className="mb-8">
                <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1E293B' }}>
                    Mijn Profiel
                </h1>
                <p className="text-sm" style={{ color: '#64748B' }}>
                    Bekijk en beheer je persoonlijke gegevens
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Persoonlijke Informatie */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#EDE9FE' }}
                            >
                                <UserIcon className="w-6 h-6" style={{ color: '#7C3AED' }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: '#2D3748' }}>
                                    {user.full_name}
                                </h2>
                                <p className="text-sm" style={{ color: '#718096' }}>
                                    {user.role === 'HR' ? 'HR Medewerker' : 'Medewerker'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    Gebruikersnaam
                                </label>
                                <Input
                                    type="text"
                                    value={user.username}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    E-mail
                                </label>
                                <Input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    Voornaam
                                </label>
                                <Input
                                    type="text"
                                    value={user.voornaam}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    Achternaam
                                </label>
                                <Input
                                    type="text"
                                    value={user.achternaam}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    Afdeling
                                </label>
                                <Input
                                    type="text"
                                    value={user.afdeling || '-'}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#718096' }}>
                                    In dienst sinds
                                </label>
                                <Input
                                    type="text"
                                    value={user.startdatum ? new Date(user.startdatum).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                    disabled
                                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#EDF2F7' }}>
                            <p className="text-sm" style={{ color: '#718096' }}>
                                <strong>Let op:</strong> Je persoonlijke gegevens kunnen alleen worden gewijzigd door HR.
                                Neem contact op met HR als je wijzigingen wilt doorvoeren.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Wachtwoord Wijzigen */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <KeyIcon className="w-6 h-6" style={{ color: '#7C3AED' }} />
                            <h3 className="text-lg font-bold" style={{ color: '#2D3748' }}>
                                Wachtwoord
                            </h3>
                        </div>

                        {!showPasswordForm ? (
                            <div>
                                <p className="text-sm mb-4" style={{ color: '#718096' }}>
                                    Je kunt je wachtwoord op elk moment wijzigen voor extra beveiliging.
                                </p>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowPasswordForm(true)}
                                    className="w-full"
                                >
                                    Wachtwoord Wijzigen
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                            Huidig Wachtwoord
                                        </label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            error={passwordForm.errors.current_password}
                                            required
                                        />
                                        {passwordForm.errors.current_password && (
                                            <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                                {passwordForm.errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                            Nieuw Wachtwoord
                                        </label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.new_password}
                                            onChange={(e) => passwordForm.setData('new_password', e.target.value)}
                                            error={passwordForm.errors.new_password}
                                            required
                                        />
                                        {passwordForm.errors.new_password && (
                                            <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                                {passwordForm.errors.new_password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                            Bevestig Nieuw Wachtwoord
                                        </label>
                                        <Input
                                            type="password"
                                            value={passwordForm.data.new_password_confirmation}
                                            onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={passwordForm.processing}>
                                            Opslaan
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                passwordForm.reset();
                                                setShowPasswordForm(false);
                                            }}
                                        >
                                            Annuleren
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
