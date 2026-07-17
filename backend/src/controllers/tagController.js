const Tag = require('../models/Tag');
const { generateUniqueSlug, successResponse, errorResponse } = require('../utils/helpers');

exports.getTags = async (req, res, next) => {
  try { res.json(successResponse(await Tag.findAll())); }
  catch (err) { next(err); }
};

exports.createTag = async (req, res, next) => {
  try {
    const slug = await generateUniqueSlug(req.body.name, Tag.slugExists);
    const tag = await Tag.create({ ...req.body, slug });
    res.status(201).json(successResponse(tag, 'Tag cree'));
  } catch (err) { next(err); }
};

exports.updateTag = async (req, res, next) => {
  try {
    const tag = await Tag.update(parseInt(req.params.id), req.body);
    if (!tag) return res.status(404).json(errorResponse('Tag introuvable'));
    res.json(successResponse(tag, 'Tag mis a jour'));
  } catch (err) { next(err); }
};

exports.deleteTag = async (req, res, next) => {
  try {
    const ok = await Tag.remove(parseInt(req.params.id));
    if (!ok) return res.status(404).json(errorResponse('Tag introuvable'));
    res.json(successResponse(null, 'Tag supprime'));
  } catch (err) { next(err); }
};
