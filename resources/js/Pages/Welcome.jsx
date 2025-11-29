export default function Welcome() {
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-lavender)' }}>
                    🎉 Overuren Systeem
                </h1>
                <p className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>
                    Laravel 12 + Inertia.js + React werkt!
                </p>
                <div className="mt-8 space-x-4">
                    <span className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-mint)', color: 'var(--color-text-primary)' }}>
                        Laravel 12
                    </span>
                    <span className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-peach)', color: 'var(--color-text-primary)' }}>
                        Inertia.js
                    </span>
                    <span className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-lavender)', color: 'var(--color-text-primary)' }}>
                        React
                    </span>
                    <span className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-text-primary)' }}>
                        PEST
                    </span>
                </div>
            </div>
        </div>
    );
}
