import { theme, componentStyles } from '../config/theme';

export default function Card({ children, className = '', variant = 'default', hover = false }) {
    const getCardStyle = () => {
        const cardStyles = componentStyles.card;
        const variantStyles = cardStyles.variants[variant] || cardStyles.variants.default;

        return {
            backgroundColor: cardStyles.base.background,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[6],
            border: variantStyles.border || cardStyles.base.border,
            boxShadow: variantStyles.boxShadow || cardStyles.base.boxShadow,
        };
    };

    return (
        <div
            className={`transition-all duration-200 ${
                hover ? 'hover:-translate-y-1 hover:shadow-lg' : ''
            } ${className}`}
            style={getCardStyle()}
        >
            {children}
        </div>
    );
}
