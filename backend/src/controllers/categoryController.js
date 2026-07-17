const Category = require('../models/Category');
const { generateUniqueSlug, successResponse, errorResponse } = require('../utils/helpers');

exports.getCategories = async (req, res, next) => {
  try {
    res.json(successResponse(await Category.findAll()));
  } catch (err) { next(err); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(parseInt(req.params.id));
    if (!category) return res.status(404).json(errorResponse('Categorie introuvable'));
    res.json(successResponse(category));
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const slug = await generateUniqueSlug(req.body.name, Category.slugExists);
    const category = await Category.create({ ...req.body, slug });
    res.status(201).json(successResponse(category, 'Categorie creee'));
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (req.body.name) {
      const existing = await Category.findById(id);
      if (existing && existing.name !== req.body.name) {
        req.body.slug = await generateUniqueSlug(req.body.name, Category.slugExists);
      }
    }
    const category = await Category.update(id, req.body);
    if (!category) return res.status(404).json(errorResponse('Categorie introuvable'));
    res.json(successResponse(category, 'Categorie mise a jour'));
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const ok = await Category.remove(parseInt(req.params.id));
    if (!ok) return res.status(404).json(errorResponse('Categorie introuvable'));
    res.json(successResponse(null, 'Categorie supprimee'));
  } catch (err) { next(err); }
};
