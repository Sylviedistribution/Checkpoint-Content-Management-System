const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const { paginate, getPaginationMeta, successResponse, errorResponse } = require('../utils/helpers');

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json(errorResponse('Aucun fichier fourni'));
    const media = await Media.create({
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_path: `/uploads/${req.file.filename}`,
      file_type: req.file.mimetype.split('/')[0],
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.user_id,
      alt_text: req.body.alt_text,
      caption: req.body.caption
    });
    res.status(201).json(successResponse(media, 'Fichier televerse'));
  } catch (err) { next(err); }
};

exports.getMedia = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { media, total } = await Media.findAll({ limit, offset, file_type: req.query.file_type });
    res.json(successResponse(media, 'Success', getPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
};

exports.deleteMedia = async (req, res, next) => {
  try {
    const media = await Media.remove(parseInt(req.params.id));
    if (!media) return res.status(404).json(errorResponse('Media introuvable'));
    // Supprime le fichier physique (best effort)
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', media.filename);
    fs.unlink(filePath, () => {});
    res.json(successResponse(null, 'Media supprime'));
  } catch (err) { next(err); }
};
