const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-mint hover:bg-opacity-90 text-text-primary hover:scale-105 shadow-md hover:shadow-lg',
    secondary: 'bg-transparent border-2 border-peach text-text-primary hover:bg-peach',
    danger: 'bg-error hover:bg-opacity-90 text-text-primary hover:scale-105',
    success: 'bg-success hover:bg-opacity-90 text-text-primary hover:scale-105',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
