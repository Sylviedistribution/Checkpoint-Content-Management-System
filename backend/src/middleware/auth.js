const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { errorResponse } = require('../utils/helpers');

// Verifie le JWT et attache l'utilisateur a la requete
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Authentification requise'));
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT user_id, username, email, role, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );
    if (!result.rows.length || !result.rows[0].is_active) {
      return res.status(401).json(errorResponse('Compte invalide ou desactive'));
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(errorResponse('Session expiree, veuillez vous reconnecter'));
    }
    return res.status(401).json(errorResponse('Token invalide'));
  }
};

// Authentification optionnelle (routes publiques enrichies si connecte)
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
      const result = await query(
        'SELECT user_id, username, email, role FROM users WHERE user_id = $1 AND is_active = true',
        [decoded.userId]
      );
      if (result.rows.length) req.user = result.rows[0];
    } catch { /* ignore : la route reste publique */ }
  }
  next();
};

// RBAC : authorize('admin', 'editor')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json(errorResponse('Authentification requise'));
  if (!roles.includes(req.user.role)) {
    return res.status(403).json(errorResponse('Acces refuse : privileges insuffisants'));
  }
  next();
};

// Proprietaire de la ressource OU role eleve
const isOwnerOrRole = (getOwnerId, ...roles) => async (req, res, next) => {
  try {
    if (roles.includes(req.user.role)) return next();
    const ownerId = await getOwnerId(req);
    if (ownerId === req.user.user_id) return next();
    return res.status(403).json(errorResponse('Acces refuse : vous n\'etes pas proprietaire de cette ressource'));
  } catch (err) { next(err); }
};

module.exports = { authenticate, optionalAuth, authorize, isOwnerOrRole };
