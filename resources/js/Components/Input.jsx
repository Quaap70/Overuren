import React from 'react';
import { theme, componentStyles } from '../config/theme';

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    rows = 4,
    ...props
}) {
    const baseClasses = `w-full focus:outline-none transition-all ${
        error ? 'animate-shake' : ''
    } ${className}`;

    const getInputStyle = (isFocused = false) => {
        const inputStyles = componentStyles.input;

        if (disabled) {
            return {
                ...inputStyles.states.disabled,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                border: `2px solid ${inputStyles.states.disabled.borderColor}`,
            };
        }

        if (error) {
            return {
                borderColor: inputStyles.states.error.borderColor,
                backgroundColor: componentStyles.input.states.default.background,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                border: `2px solid ${inputStyles.states.error.borderColor}`,
                boxShadow: isFocused ? inputStyles.states.error.ring : 'none',
            };
        }

        if (isFocused) {
            return {
                borderColor: inputStyles.states.focus.borderColor,
                backgroundColor: componentStyles.input.states.default.background,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.sm,
                padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                border: `2px solid ${inputStyles.states.focus.borderColor}`,
                boxShadow: inputStyles.states.focus.ring,
            };
        }

        return {
            borderColor: inputStyles.states.default.borderColor,
            backgroundColor: inputStyles.states.default.background,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm,
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            border: `2px solid ${inputStyles.states.default.borderColor}`,
        };
    };

    const inputProps = {
        value,
        onChange,
        placeholder,
        disabled,
        className: baseClasses,
        style: getInputStyle(),
        onFocus: (e) => {
            Object.assign(e.currentTarget.style, getInputStyle(true));
        },
        onBlur: (e) => {
            Object.assign(e.currentTarget.style, getInputStyle(false));
        },
        ...props,
    };

    return (
        <div className="mb-4">
            {label && (
                <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.colors.neutral[700] }}
                >
                    {label}
                    {required && <span className="ml-1" style={{ color: theme.colors.error[500] }}>*</span>}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    rows={rows}
                    {...inputProps}
                />
            ) : (
                <input
                    type={type}
                    {...inputProps}
                />
            )}
            {error && (
                <p className="text-sm mt-1" style={{ color: theme.colors.error[600] }}>
                    {error}
                </p>
            )}
        </div>
    );
}
