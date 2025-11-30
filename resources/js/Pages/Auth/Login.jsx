import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F0F4F8' }}>
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
                <div className="text-center mb-8">
                    <ClockIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#D4A5FF' }} />
                    <h1 className="text-4xl font-bold mb-2" style={{ color: '#2D3748' }}>
                        Overuren Systeem
                    </h1>
                    <p style={{ color: '#718096' }}>Log in om verder te gaan</p>
                </div>

                <form onSubmit={submit}>
                    {errors.username && (
                        <div
                            className="px-4 py-3 rounded-lg mb-4 border"
                            style={{
                                backgroundColor: 'rgba(255, 179, 186, 0.2)',
                                borderColor: '#FFB3BA',
                                color: '#721c24'
                            }}
                        >
                            {errors.username}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block mb-2 font-medium" style={{ color: '#2D3748' }}>
                            Gebruikersnaam
                        </label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            placeholder="jan1"
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2"
                            style={{
                                borderColor: errors.username ? '#FFB3BA' : '#E2E8F0',
                                backgroundColor: '#F7FAFC'
                            }}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium" style={{ color: '#2D3748' }}>
                            Wachtwoord
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2"
                            style={{
                                borderColor: errors.password ? '#FFB3BA' : '#E2E8F0',
                                backgroundColor: '#F7FAFC'
                            }}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                                className="mr-2"
                            />
                            <span style={{ color: '#718096' }}>Onthoud mij</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: '#D4A5FF',
                            color: '#2D3748'
                        }}
                    >
                        {processing ? 'Bezig met inloggen...' : 'Inloggen'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm" style={{ color: '#718096' }}>
                    <p>Test accounts:</p>
                    <p className="mt-2">
                        <strong>HR:</strong> linda / Welkom123!<br />
                        <strong>Medewerker:</strong> jan1 / Welkom123!
                    </p>
                </div>
            </div>
        </div>
    );
}
