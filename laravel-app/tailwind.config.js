import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'bg-primary': '#F0F4F8',
                'bg-card': '#FFFFFF',
                'mint': '#B8E6D1',
                'peach': '#FFD3BA',
                'lavender': '#D4A5FF',
                'warning': '#FFE5B4',
                'error': '#FFB3BA',
                'success': '#BAFFC9',
                'text-primary': '#2D3748',
                'text-secondary': '#718096'
            },
            borderRadius: {
                'card': '12px',
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0,0,0,0.08)',
                'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
            }
        },
    },
    plugins: [],
};
