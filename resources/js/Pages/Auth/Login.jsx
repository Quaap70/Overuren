import { useForm, Head } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import { ClockIcon } from '@heroicons/react/24/outline';
import { theme } from '../../config/theme';

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
        <>
            <Head title="Login" />
            <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme.colors.neutral[50] }}>
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div
                            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.primary[100] }}
                        >
                            <ClockIcon className="w-12 h-12" style={{ color: theme.colors.primary[600] }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.neutral[800] }}>
                            Overuren Systeem
                        </h1>
                        <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
                            Log in om verder te gaan
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        {errors.username && (
                            <div
                                className="px-4 py-3 rounded-lg mb-4 border text-sm"
                                style={{
                                    backgroundColor: theme.colors.error[50],
                                    borderColor: theme.colors.error[200],
                                    color: theme.colors.error[700]
                                }}
                            >
                                {errors.username}
                            </div>
                        )}

                        <Input
                            label="Gebruikersnaam"
                            type="text"
                            value={data.username}
                            onChange={e => setData('username', e.target.value)}
                            placeholder="jan1"
                            error={errors.username}
                            required
                        />

                        <Input
                            label="Wachtwoord"
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="••••••••"
                            error={errors.password}
                            required
                        />

                        <div className="mb-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="mr-2 w-4 h-4 rounded border-2 cursor-pointer"
                                    style={{
                                        borderColor: theme.colors.neutral[300],
                                        accentColor: theme.colors.primary[600]
                                    }}
                                />
                                <span className="text-sm" style={{ color: theme.colors.neutral[600] }}>
                                    Onthoud mij
                                </span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            {processing ? 'Bezig met inloggen...' : 'Inloggen'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t text-center text-xs" style={{ borderColor: theme.colors.neutral[200] }}>
                        <p className="font-medium mb-3" style={{ color: theme.colors.neutral[600] }}>
                            Test accounts:
                        </p>
                        <div className="space-y-2">
                            <p style={{ color: theme.colors.neutral[500] }}>
                                <strong style={{ color: theme.colors.neutral[700] }}>HR:</strong> linda / Welkom123!
                            </p>
                            <p style={{ color: theme.colors.neutral[500] }}>
                                <strong style={{ color: theme.colors.neutral[700] }}>Medewerker:</strong> jan1 / Welkom123!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
