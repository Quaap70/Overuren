export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium mb-2" style={{ color: '#2D3748' }}>
                    {label}
                    {required && <span className="ml-1" style={{ color: '#FFB3BA' }}>*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition-colors ${
                    error ? 'animate-shake' : ''
                } ${className}`}
                style={{
                    borderColor: error ? '#FFB3BA' : '#E2E8F0',
                    backgroundColor: '#F7FAFC'
                }}
                {...props}
            />
            {error && <p className="text-sm mt-1" style={{ color: '#FFB3BA' }}>{error}</p>}
        </div>
    );
}
