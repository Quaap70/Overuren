/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validatie fout',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Deze waarde bestaat al',
      field: err.errors[0]?.path
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Ongeldige token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token verlopen' });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Er is een fout opgetreden'
  });
};

/**
 * 404 handler
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route niet gevonden'
  });
};
