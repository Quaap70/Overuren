const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-bg-card rounded-card shadow-card p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
