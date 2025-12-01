import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Card from '../Components/Card';
import Button from '../Components/Button';
import Input from '../Components/Input';
import { KeyIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function WachtwoordWijzigen({ mustChange }) {
    const { data, setData, post, errors, processing } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/wachtwoord-wijzigen');
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7FAFC' }}>
            <Head title="Wachtwoord Wijzigen Vereist" />

            <div className="w-full max-w-md px-4">
                {mustChange && (
                    <div
                        className="mb-6 p-4 rounded-lg flex items-start gap-3"
                        style={{ backgroundColor: '#FEF3C7', border: '2px solid #F59E0B' }}
                    >
                        <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" style={{ color: '#D97706' }} />
                        <div>
                            <h3 className="font-semibold mb-1" style={{ color: '#92400E' }}>
                                Wachtwoord wijzigen vereist
                            </h3>
                            <p className="text-sm" style={{ color: '#78350F' }}>
                                Om veiligheidsredenen moet je je wachtwoord wijzigen voordat je verder kunt.
                            </p>
                        </div>
                    </div>
                )}

                <Card>
                    <div className="text-center mb-6">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                            style={{ backgroundColor: '#EDE9FE' }}
                        >
                            <KeyIcon className="w-8 h-8" style={{ color: '#7C3AED' }} />
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: '#2D3748' }}>
                            Wachtwoord Wijzigen
                        </h1>
                        <p className="text-sm mt-2" style={{ color: '#718096' }}>
                            Kies een sterk, uniek wachtwoord voor je account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Huidig wachtwoord */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                    Huidig Wachtwoord *
                                </label>
                                <Input
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    error={errors.current_password}
                                    placeholder="Voer je huidige wachtwoord in"
                                    required
                                    autoFocus
                                />
                                {errors.current_password && (
                                    <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                        {errors.current_password}
                                    </p>
                                )}
                            </div>

                            {/* Nieuw wachtwoord */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                    Nieuw Wachtwoord *
                                </label>
                                <Input
                                    type="password"
                                    value={data.new_password}
                                    onChange={(e) => setData('new_password', e.target.value)}
                                    error={errors.new_password}
                                    placeholder="Minimaal 8 tekens"
                                    required
                                />
                                {errors.new_password && (
                                    <p className="text-sm mt-1" style={{ color: '#E53E3E' }}>
                                        {errors.new_password}
                                    </p>
                                )}
                                <p className="text-xs mt-1" style={{ color: '#718096' }}>
                                    Minimaal 8 tekens lang
                                </p>
                            </div>

                            {/* Bevestig nieuw wachtwoord */}
                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                                    Bevestig Nieuw Wachtwoord *
                                </label>
                                <Input
                                    type="password"
                                    value={data.new_password_confirmation}
                                    onChange={(e) => setData('new_password_confirmation', e.target.value)}
                                    placeholder="Herhaal je nieuwe wachtwoord"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? 'Wachtwoord Wijzigen...' : 'Wachtwoord Wijzigen'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#EDF2F7' }}>
                        <h4 className="text-sm font-semibold mb-2" style={{ color: '#2D3748' }}>
                            Tips voor een sterk wachtwoord:
                        </h4>
                        <ul className="text-xs space-y-1" style={{ color: '#718096' }}>
                            <li>• Gebruik minimaal 8 tekens</li>
                            <li>• Mix hoofdletters, kleine letters, cijfers en symbolen</li>
                            <li>• Gebruik geen persoonlijke informatie</li>
                            <li>• Gebruik een uniek wachtwoord voor elk account</li>
                        </ul>
                    </div>
                </Card>
            </div>
        </div>
    );
}
