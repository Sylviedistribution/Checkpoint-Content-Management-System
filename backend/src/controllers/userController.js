const User = require('../models/User');
const { paginate, getPaginationMeta, successResponse, errorResponse } = require('../utils/helpers');

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { users, total } = await User.findAll({
      limit, offset, role: req.query.role, search: req.query.search
    });
    res.json(successResponse(users, 'Success', getPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(parseInt(req.params.id));
    if (!user) return res.status(404).json(errorResponse('Utilisateur introuvable'));
    res.json(successResponse(user));
  } catch (err) { next(err); }
};

// PUT /api/v1/users/:id — soi-meme (profil) ou admin (tout, y compris role)
exports.updateUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const isSelf = req.user.user_id === id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) return res.status(403).json(errorResponse('Acces refuse'));

    // Seul un admin peut changer role / is_active
    if (!isAdmin) { delete req.body.role; delete req.body.is_active; }
    if (req.body.role && !['admin', 'editor', 'author', 'subscriber'].includes(req.body.role)) {
      return res.status(422).json(errorResponse('Role invalide'));
    }
    const user = await User.update(id, req.body);
    if (!user) return res.status(404).json(errorResponse('Utilisateur introuvable'));
    res.json(successResponse(user, 'Profil mis a jour'));
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (id === req.user.user_id) {
      return res.status(400).json(errorResponse('Impossible de supprimer votre propre compte'));
    }
    const ok = await User.remove(id);
    if (!ok) return res.status(404).json(errorResponse('Utilisateur introuvable'));
    res.json(successResponse(null, 'Utilisateur supprime'));
  } catch (err) { next(err); }
};
