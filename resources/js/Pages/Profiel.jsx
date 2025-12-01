import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '../Components/Layout';
import Card from '../Components/Card';
import Button from '../Components/Button';
import Input from '../Components/Input';
import { UserIcon, KeyIcon, PencilIcon } from '@heroicons/react/24/outline';
import { theme } from '../config/theme';

export default function Profiel({ user }) {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const isHR = user.role === 'HR';

    // Profile form (only for HR)
    const profileForm = useForm({
        voornaam: user.voornaam,
        achternaam: user.achternaam,
        afdeling: user.afdeling,
    });

    // Email form (all users)
    const emailForm = useForm({
        email: user.email,
    });

    // Password form (all users)
    const passwordForm = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.post('/profiel', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingProfile(false);
            },
        });
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        emailForm.post('/profiel/email', {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingEmail(false);
            },
        });
    };

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

    const cancelProfileEdit = () => {
        profileForm.setData({
            voornaam: user.voornaam,
            achternaam: user.achternaam,
            afdeling: user.afdeling,
        });
        profileForm.clearErrors();
        setIsEditingProfile(false);
    };

    const cancelEmailEdit = () => {
        emailForm.setData('email', user.email);
        emailForm.clearErrors();
        setIsEditingEmail(false);
    };

    return (
        <Layout>
            <Head title="Mijn Profiel" />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-1" style={{ color: theme.colors.neutral[800] }}>
                    Mijn Profiel
                </h1>
                <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                    Beheer je persoonlijke gegevens en beveiligingsinstellingen
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Persoonlijke Gegevens Card */}
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: theme.colors.primary[100] }}
                                >
                                    <UserIcon className="w-6 h-6" style={{ color: theme.colors.primary[600] }} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: theme.colors.neutral[800] }}>
                                        Persoonlijke Gegevens
                                    </h2>
                                    <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                                        {isHR ? 'Als HR kun je je eigen gegevens wijzigen' : 'Neem contact op met HR voor wijzigingen'}
                                    </p>
                                </div>
                            </div>
                            {isHR && !isEditingProfile && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditingProfile(true)}
                                >
                                    <PencilIcon className="w-4 h-4 inline mr-2" />
                                    Bewerken
                                </Button>
                            )}
                        </div>

                        {/* Profile Form (HR only) or Display */}
                        {isHR && isEditingProfile ? (
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
                                            Voornaam *
                                        </label>
                                        <Input
                                            type="text"
                                            value={profileForm.data.voornaam}
                                            onChange={(e) => profileForm.setData('voornaam', e.target.value)}
                                            error={profileForm.errors.voornaam}
                                            required
                                        />
                                        {profileForm.errors.voornaam && (
                                            <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                                {profileForm.errors.voornaam}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
                                            Achternaam *
                                        </label>
                                        <Input
                                            type="text"
                                            value={profileForm.data.achternaam}
                                            onChange={(e) => profileForm.setData('achternaam', e.target.value)}
                                            error={profileForm.errors.achternaam}
                                            required
                                        />
                                        {profileForm.errors.achternaam && (
                                            <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                                {profileForm.errors.achternaam}
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
                                            Afdeling *
                                        </label>
                                        <Input
                                            type="text"
                                            value={profileForm.data.afdeling}
                                            onChange={(e) => profileForm.setData('afdeling', e.target.value)}
                                            error={profileForm.errors.afdeling}
                                            required
                                        />
                                        {profileForm.errors.afdeling && (
                                            <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                                {profileForm.errors.afdeling}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={profileForm.processing}>
                                        Wijzigingen Opslaan
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={cancelProfileEdit}>
                                        Annuleren
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        Gebruikersnaam
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.username}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        Rol
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.role === 'HR' ? 'HR Medewerker' : 'Medewerker'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        Voornaam
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.voornaam}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        Achternaam
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.achternaam}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        Afdeling
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.afdeling || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium mb-1" style={{ color: theme.colors.neutral[500] }}>
                                        In dienst sinds
                                    </label>
                                    <p className="text-sm font-medium" style={{ color: theme.colors.neutral[800] }}>
                                        {user.startdatum ? new Date(user.startdatum).toLocaleDateString('nl-NL', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Email Card */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                                E-mailadres
                            </h3>
                            {!isEditingEmail && (
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsEditingEmail(true)}
                                >
                                    <PencilIcon className="w-4 h-4 inline mr-2" />
                                    Wijzigen
                                </Button>
                            )}
                        </div>

                        {isEditingEmail ? (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
                                        Nieuw E-mailadres
                                    </label>
                                    <Input
                                        type="email"
                                        value={emailForm.data.email}
                                        onChange={(e) => emailForm.setData('email', e.target.value)}
                                        error={emailForm.errors.email}
                                        required
                                    />
                                    {emailForm.errors.email && (
                                        <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                            {emailForm.errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={emailForm.processing}>
                                        Opslaan
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={cancelEmailEdit}>
                                        Annuleren
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm" style={{ color: theme.colors.neutral[600] }}>
                                {user.email}
                            </p>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <KeyIcon className="w-6 h-6" style={{ color: theme.colors.primary[600] }} />
                            <h3 className="text-lg font-bold" style={{ color: theme.colors.neutral[800] }}>
                                Wachtwoord
                            </h3>
                        </div>

                        {!showPasswordForm ? (
                            <div>
                                <p className="text-sm mb-4" style={{ color: theme.colors.neutral[600] }}>
                                    Wijzig je wachtwoord regelmatig voor extra beveiliging.
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
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
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
                                        <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                            {passwordForm.errors.current_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
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
                                        <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                                            {passwordForm.errors.new_password}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.neutral[700] }}>
                                        Bevestig Nieuw Wachtwoord
                                    </label>
                                    <Input
                                        type="password"
                                        value={passwordForm.data.new_password_confirmation}
                                        onChange={(e) => passwordForm.setData('new_password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button type="submit" disabled={passwordForm.processing} className="w-full">
                                        Opslaan
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            passwordForm.reset();
                                            setShowPasswordForm(false);
                                        }}
                                        className="w-full"
                                    >
                                        Annuleren
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
