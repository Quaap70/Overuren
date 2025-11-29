export default function Button({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    className = ''
}) {
    const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'hover:bg-opacity-90 text-text-primary hover:scale-105 shadow-md hover:shadow-lg',
        secondary: 'bg-transparent border-2 text-text-primary',
        danger: 'hover:bg-opacity-90 text-text-primary hover:scale-105',
        success: 'hover:bg-opacity-90 text-text-primary hover:scale-105',
    };

    const variantStyles = {
        primary: { backgroundColor: '#B8E6D1' },
        secondary: { borderColor: '#FFD3BA', color: '#2D3748' },
        danger: { backgroundColor: '#FFB3BA' },
        success: { backgroundColor: '#BAFFC9' },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={variantStyles[variant]}
        >
            {children}
        </button>
    );
}
