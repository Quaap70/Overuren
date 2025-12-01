import React from 'react';
import { theme, componentStyles } from '../config/theme';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    type = 'button',
    onClick,
    disabled = false,
    className = ''
}) {
    const baseClasses = 'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none';

    const variantClasses = {
        primary: 'text-white shadow-sm hover:shadow-md',
        secondary: 'border border-solid',
        danger: 'text-white shadow-sm hover:shadow-md',
        ghost: '',
    };

    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
    };

    const getVariantStyle = () => {
        const styles = componentStyles.button.variants[variant];

        if (!styles) return {};

        const baseStyle = {
            backgroundColor: styles.background,
            color: styles.color,
            borderRadius: theme.borderRadius.md,
        };

        if (styles.border) {
            baseStyle.border = styles.border;
        }

        return baseStyle;
    };

    const getHoverStyle = () => {
        const styles = componentStyles.button.variants[variant];

        if (!styles) return {};

        return {
            backgroundColor: styles.hoverBackground,
        };
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant] || ''} ${sizeClasses[size]} ${className}`}
            style={getVariantStyle()}
            onMouseEnter={(e) => {
                if (!disabled) {
                    const hoverStyles = getHoverStyle();
                    Object.assign(e.currentTarget.style, hoverStyles);
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    const baseStyles = getVariantStyle();
                    Object.assign(e.currentTarget.style, baseStyles);
                }
            }}
            onFocus={(e) => {
                if (!disabled) {
                    const styles = componentStyles.button.variants[variant];
                    if (styles?.focusRing) {
                        e.currentTarget.style.boxShadow = styles.focusRing;
                    }
                }
            }}
            onBlur={(e) => {
                if (!disabled) {
                    e.currentTarget.style.boxShadow = variantClasses[variant]?.includes('shadow') ? theme.shadows.sm : 'none';
                }
            }}
        >
            {children}
        </button>
    );
}
