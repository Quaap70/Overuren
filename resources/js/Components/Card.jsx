export default function Card({ children, className = '', hover = false }) {
    return (
        <div
            className={`rounded-xl p-6 transition-all duration-200 ${
                hover ? 'hover:-translate-y-1' : ''
            } ${className}`}
            style={{
                backgroundColor: '#FFFFFF',
                boxShadow: hover
                    ? '0 4px 12px rgba(0,0,0,0.12)'
                    : '0 2px 8px rgba(0,0,0,0.08)'
            }}
        >
            {children}
        </div>
    );
}
