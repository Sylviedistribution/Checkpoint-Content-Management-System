const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/helpers');

const signTokens = (user) => ({
  accessToken: jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  ),
  refreshToken: jwt.sign(
    { userId: user.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  )
});

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    // Le role est toujours 'subscriber' a l'inscription (jamais fourni par le client)
    const user = await User.create({ username, email, password, first_name, last_name });
    const tokens = signTokens(user);
    await ActivityLog.log({
      user_id: user.user_id, action: 'register', entity_type: 'user',
      entity_id: user.user_id, ip_address: req.ip
    });
    res.status(201).json(successResponse({ user, ...tokens }, 'Compte cree avec succes'));
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !(await User.comparePassword(password, user.password_hash))) {
      return res.status(401).json(errorResponse('Email ou mot de passe incorrect'));
    }
    if (!user.is_active) {
      return res.status(403).json(errorResponse('Compte desactive'));
    }
    await User.updateLastLogin(user.user_id);
    const tokens = signTokens(user);
    delete user.password_hash;
    delete user.verification_token;
    await ActivityLog.log({
      user_id: user.user_id, action: 'login', entity_type: 'user',
      entity_id: user.user_id, ip_address: req.ip
    });
    res.json(successResponse({ user, ...tokens }, 'Connexion reussie'));
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json(errorResponse('refreshToken requis'));
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) return res.status(401).json(errorResponse('Utilisateur invalide'));
    const tokens = signTokens(user);
    res.json(successResponse(tokens, 'Token renouvele'));
  } catch {
    res.status(401).json(errorResponse('Refresh token invalide ou expire'));
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    res.json(successResponse(user));
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(422).json(errorResponse('Nouveau mot de passe : 8 caracteres minimum'));
    }
    const user = await User.findByEmail(req.user.email);
    if (!(await User.comparePassword(currentPassword, user.password_hash))) {
      return res.status(401).json(errorResponse('Mot de passe actuel incorrect'));
    }
    await User.updatePassword(req.user.user_id, newPassword);
    res.json(successResponse(null, 'Mot de passe modifie'));
  } catch (err) { next(err); }
};
