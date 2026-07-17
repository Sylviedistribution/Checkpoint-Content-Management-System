const { body, param, query, validationResult } = require('express-validator');
const { errorResponse } = require('../utils/helpers');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errorResponse('Erreurs de validation', errors.array()));
  }
  next();
};

const registerRules = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Nom d\'utilisateur : 3 a 50 caracteres')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Caracteres autorises : lettres, chiffres, _ . -'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe : 8 caracteres minimum')
    .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre'),
  body('first_name').optional().trim().isLength({ max: 50 }),
  body('last_name').optional().trim().isLength({ max: 50 })
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
];

const postRules = [
  body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Titre : 3 a 255 caracteres'),
  body('content').notEmpty().withMessage('Le contenu est requis'),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('category_id').optional({ nullable: true }).isInt(),
  body('tags').optional().isArray(),
  body('excerpt').optional().trim(),
  body('meta_title').optional().trim().isLength({ max: 255 }),
  body('meta_description').optional().trim()
];

const categoryRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nom : 2 a 100 caracteres'),
  body('description').optional().trim(),
  body('parent_id').optional({ nullable: true }).isInt()
];

const tagRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Nom : 2 a 50 caracteres')
];

const commentRules = [
  body('content').trim().isLength({ min: 2, max: 5000 }).withMessage('Commentaire : 2 a 5000 caracteres'),
  body('post_id').isInt().withMessage('post_id requis'),
  body('parent_id').optional({ nullable: true }).isInt()
];

const idParam = [param('id').isInt().withMessage('Identifiant invalide')];

const paginationRules = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

module.exports = {
  validate, registerRules, loginRules, postRules,
  categoryRules, tagRules, commentRules, idParam, paginationRules
};
