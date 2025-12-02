import { Head, useForm, Link } from '@inertiajs/react';
import Layout from '../../../Components/Layout';
import Card from '../../../Components/Card';
import Button from '../../../Components/Button';
import Input from '../../../Components/Input';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function GebruikerNieuw({ afdelingen }) {
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
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/hr/gebruikers');
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
