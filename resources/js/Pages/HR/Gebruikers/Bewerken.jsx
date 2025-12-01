import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../../../Components/Layout';
import Card from '../../../Components/Card';
import Button from '../../../Components/Button';
import Input from '../../../Components/Input';
import ConfirmModal from '../../../Components/ConfirmModal';
import { ArrowLeftIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function GebruikerBewerken({ gebruiker, afdelingen }) {
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [toggleActiveConfirm, setToggleActiveConfirm] = useState(false);

    const { data, setData, put, errors, processing } = useForm({
        email: gebruiker.email || '',
        voornaam: gebruiker.voornaam || '',
        achternaam: gebruiker.achternaam || '',
        role: gebruiker.role || 'MEDEWERKER',
        afdeling: gebruiker.afdeling || '',
        startdatum: gebruiker.startdatum || '',
    });

    const passwordForm = useForm({
        new_password: '',
        new_password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/hr/gebruikers/${gebruiker.id}`);
    };

    const handlePasswordReset = (e) => {
        e.preventDefault();
        passwordForm.post(`/hr/gebruikers/${gebruiker.id}/wachtwoord-reset`, {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setShowPasswordReset(false);
            },
        });
    };

    const handleToggleActive = () => {
        setToggleActiveConfirm(true);
    };

    const confirmToggleActive = () => {
        const action = gebruiker.is_active ? 'deactiveren' : 'activeren';
        router.post(`/hr/gebruikers/${gebruiker.id}/${action}`, {}, {
            preserveScroll: true,
            onFinish: () => setToggleActiveConfirm(false),
        });
    };

    return (
        <Layout>
            <Head title={`${gebruiker.voornaam} ${gebruiker.achternaam} Bewerken`} />

            <div className="mb-6">
                <Link href="/hr/medewerkers">
                    <Button variant="secondary">
                        <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
                        Terug naar Medewerkers
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2D3748' }}>
                            Gebruiker Bewerken
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username (read-only) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                        Gebruikersnaam
                                    </label>
                                    <Input
                                        type="text"
                                        value={gebruiker.username}
                                        disabled
                                        style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                                    />
                                    <p className="text-xs mt-1" style={{ color: '#718096' }}>
                                        Gebruikersnaam kan niet worden gewijzigd
                                    </p>
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
                                        className="w-full px-4 py-2 rounded-md"
                                        style={{
                                            border: '2px solid #D4A5FF',
                                            backgroundColor: '#FFFFFF',
                                            color: '#2D3748',
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
                                        className="w-full px-4 py-2 rounded-md"
                                        style={{
                                            border: '2px solid #D4A5FF',
                                            backgroundColor: '#FFFFFF',
                                            color: '#2D3748',
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
                                <div className="md:col-span-2">
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
                            </div>

                            <div className="mt-6 flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    Wijzigingen Opslaan
                                </Button>
                                <Link href="/hr/medewerkers">
                                    <Button type="button" variant="secondary">
                                        Annuleren
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Status Card */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4" style={{ color: '#2D3748' }}>
                            Account Status
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium" style={{ color: '#718096' }}>
                                    Status:
                                </span>
                                <div
                                    className="inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium"
                                    style={{
                                        backgroundColor: gebruiker.is_active ? '#BAFFC9' : '#FFB3BA',
                                        color: '#2D3748',
                                    }}
                                >
                                    {gebruiker.is_active ? 'Actief' : 'Inactief'}
                                </div>
                            </div>
                            <Button
                                variant={gebruiker.is_active ? 'danger' : 'success'}
                                onClick={handleToggleActive}
                                className="w-full"
                            >
                                {gebruiker.is_active ? 'Deactiveren' : 'Activeren'}
                            </Button>
                        </div>
                    </Card>

                    {/* Password Reset Card */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4" style={{ color: '#2D3748' }}>
                            Wachtwoord
                        </h3>

                        {!showPasswordReset ? (
                            <Button
                                variant="secondary"
                                onClick={() => setShowPasswordReset(true)}
                                className="w-full"
                            >
                                <KeyIcon className="w-4 h-4 inline mr-2" />
                                Wachtwoord Resetten
                            </Button>
                        ) : (
                            <form onSubmit={handlePasswordReset}>
                                <div className="space-y-4">
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
                                            Bevestig Wachtwoord
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
                                                setShowPasswordReset(false);
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

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={toggleActiveConfirm}
                onClose={() => setToggleActiveConfirm(false)}
                title={gebruiker.is_active ? 'Gebruiker deactiveren' : 'Gebruiker activeren'}
                message={gebruiker.is_active
                    ? 'Weet je zeker dat je deze gebruiker wilt deactiveren?'
                    : 'Weet je zeker dat je deze gebruiker wilt activeren?'}
                onConfirm={confirmToggleActive}
                confirmText={gebruiker.is_active ? 'Deactiveren' : 'Activeren'}
                variant={gebruiker.is_active ? 'danger' : 'success'}
            />
        </Layout>
    );
}
