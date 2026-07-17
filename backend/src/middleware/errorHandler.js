const logger = require('../utils/logger');
const { errorResponse } = require('../utils/helpers');

const notFound = (req, res) =>
  res.status(404).json(errorResponse(`Route non trouvee : ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl });

  // Erreurs PostgreSQL courantes
  if (err.code === '23505') return res.status(409).json(errorResponse('Cette valeur existe deja (contrainte d\'unicite)'));
  if (err.code === '23503') return res.status(400).json(errorResponse('Reference invalide (cle etrangere)'));
  if (err.code === '22P02') return res.status(400).json(errorResponse('Format de donnees invalide'));

  // Multer
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux' : err.message;
    return res.status(400).json(errorResponse(msg));
  }

  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Erreur interne du serveur'
    : err.message;
  res.status(status).json(errorResponse(message));
};

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { notFound, errorHandler, ApiError };
