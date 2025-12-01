/**
 * Design System Theme
 *
 * Centralized theme configuration for consistent UI/UX
 */

export const theme = {
    // Color Palette
    colors: {
        // Primary colors
        primary: {
            50: '#F5F3FF',   // Very light purple
            100: '#EDE9FE',  // Light purple background
            200: '#DDD6FE',  // Light purple border
            500: '#8B5CF6',  // Main purple
            600: '#7C3AED',  // Dark purple
            700: '#6D28D9',  // Darker purple
        },

        // Neutral colors (Slate)
        neutral: {
            50: '#F8FAFC',   // Background
            100: '#F1F5F9',  // Light background
            200: '#E2E8F0',  // Borders
            300: '#CBD5E1',  // Disabled
            400: '#94A3B8',  // Placeholder
            500: '#64748B',  // Secondary text
            600: '#475569',  // Text
            700: '#334155',  // Dark text
            800: '#1E293B',  // Heading
            900: '#0F172A',  // Darkest
        },

        // Semantic colors
        success: {
            50: '#F0FDF4',
            100: '#DCFCE7',
            500: '#22C55E',
            600: '#16A34A',
            700: '#15803D',
        },

        error: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
        },

        warning: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
        },

        info: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
        },
    },

    // Spacing scale (in pixels, converted to rem in components)
    spacing: {
        0: '0',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
    },

    // Typography
    typography: {
        fontFamily: {
            sans: 'Inter, system-ui, -apple-system, sans-serif',
        },
        fontSize: {
            xs: '0.75rem',      // 12px
            sm: '0.875rem',     // 14px
            base: '1rem',       // 16px
            lg: '1.125rem',     // 18px
            xl: '1.25rem',      // 20px
            '2xl': '1.5rem',    // 24px
            '3xl': '1.875rem',  // 30px
            '4xl': '2.25rem',   // 36px
        },
        fontWeight: {
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
        },
        lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
        },
    },

    // Border radius
    borderRadius: {
        none: '0',
        sm: '0.25rem',    // 4px
        DEFAULT: '0.5rem', // 8px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
        full: '9999px',
    },

    // Shadows
    shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    // Transitions
    transitions: {
        fast: '150ms ease-in-out',
        DEFAULT: '200ms ease-in-out',
        slow: '300ms ease-in-out',
    },
};

// Component-specific styles
export const componentStyles = {
    button: {
        base: {
            fontWeight: theme.typography.fontWeight.medium,
            borderRadius: theme.borderRadius.md,
            transition: theme.transitions.DEFAULT,
            fontSize: theme.typography.fontSize.sm,
        },
        sizes: {
            sm: {
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                fontSize: theme.typography.fontSize.xs,
            },
            md: {
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                fontSize: theme.typography.fontSize.sm,
            },
            lg: {
                padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
                fontSize: theme.typography.fontSize.base,
            },
        },
        variants: {
            primary: {
                background: theme.colors.primary[600],
                color: '#FFFFFF',
                hoverBackground: theme.colors.primary[700],
                focusRing: `0 0 0 3px ${theme.colors.primary[200]}`,
            },
            secondary: {
                background: theme.colors.neutral[100],
                color: theme.colors.neutral[700],
                hoverBackground: theme.colors.neutral[200],
                border: `1px solid ${theme.colors.neutral[300]}`,
                focusRing: `0 0 0 3px ${theme.colors.neutral[200]}`,
            },
            success: {
                background: theme.colors.success[600],
                color: '#FFFFFF',
                hoverBackground: theme.colors.success[700],
                focusRing: `0 0 0 3px ${theme.colors.success[100]}`,
            },
            danger: {
                background: theme.colors.error[600],
                color: '#FFFFFF',
                hoverBackground: theme.colors.error[700],
                focusRing: `0 0 0 3px ${theme.colors.error[200]}`,
            },
            ghost: {
                background: 'transparent',
                color: theme.colors.neutral[600],
                hoverBackground: theme.colors.neutral[100],
            },
        },
    },

    input: {
        base: {
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            border: `2px solid ${theme.colors.neutral[200]}`,
            transition: theme.transitions.DEFAULT,
        },
        states: {
            default: {
                borderColor: theme.colors.neutral[200],
                background: '#FFFFFF',
            },
            focus: {
                borderColor: theme.colors.primary[500],
                outline: 'none',
                ring: `0 0 0 3px ${theme.colors.primary[100]}`,
            },
            error: {
                borderColor: theme.colors.error[500],
                ring: `0 0 0 3px ${theme.colors.error[100]}`,
            },
            disabled: {
                background: theme.colors.neutral[100],
                borderColor: theme.colors.neutral[200],
                color: theme.colors.neutral[400],
                cursor: 'not-allowed',
            },
        },
    },

    card: {
        base: {
            background: '#FFFFFF',
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing[6],
            border: `1px solid ${theme.colors.neutral[200]}`,
            boxShadow: theme.shadows.sm,
        },
        variants: {
            default: {
                border: `1px solid ${theme.colors.neutral[200]}`,
            },
            elevated: {
                boxShadow: theme.shadows.lg,
                border: 'none',
            },
            bordered: {
                border: `2px solid ${theme.colors.neutral[300]}`,
                boxShadow: 'none',
            },
        },
    },
};

export default theme;
