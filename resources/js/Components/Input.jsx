export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    required = false,
    className = '',
    rows = 4,
    ...props
}) {
    const baseClasses = `w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
        error ? 'animate-shake' : ''
    } ${className}`;

    const baseStyles = {
        borderColor: error ? '#FFB3BA' : '#E2E8F0',
        backgroundColor: '#F7FAFC'
    };

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                    {label}
                    {required && <span className="ml-1" style={{ color: '#FFB3BA' }}>*</span>}
                </label>
            )}
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={baseClasses}
                    style={baseStyles}
                    {...props}
                />
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={baseClasses}
                    style={baseStyles}
                    {...props}
                />
            )}
            {error && <p className="text-sm mt-1" style={{ color: '#FFB3BA' }}>{error}</p>}
        </div>
    );
}
