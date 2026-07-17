const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { paginate, getPaginationMeta, successResponse, errorResponse } = require('../utils/helpers');

// GET /api/v1/comments?status=pending (moderation, editor+)
exports.getComments = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const { comments, total } = await Comment.findAll({ limit, offset, status: req.query.status });
    res.json(successResponse(comments, 'Success', getPaginationMeta(total, page, limit)));
  } catch (err) { next(err); }
};

// GET /api/v1/posts/:postId/comments (public : approuves)
exports.getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.findByPost(parseInt(req.params.postId));
    res.json(successResponse(comments));
  } catch (err) { next(err); }
};

// POST /api/v1/comments (utilisateur connecte)
exports.createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(parseInt(req.body.post_id));
    if (!post || post.status !== 'published') {
      return res.status(404).json(errorResponse('Article introuvable'));
    }
    if (!post.allow_comments) {
      return res.status(403).json(errorResponse('Les commentaires sont fermes sur cet article'));
    }
    // Les membres du staff sont auto-approuves
    const status = ['admin', 'editor', 'author'].includes(req.user.role) ? 'approved' : 'pending';
    const comment = await Comment.create({
      post_id: req.body.post_id,
      user_id: req.user.user_id,
      parent_id: req.body.parent_id,
      content: req.body.content,
      ip_address: req.ip,
      user_agent: req.get('user-agent'),
      status
    });
    const msg = status === 'approved' ? 'Commentaire publie' : 'Commentaire soumis pour moderation';
    res.status(201).json(successResponse(comment, msg));
  } catch (err) { next(err); }
};

// PATCH /api/v1/comments/:id/status (editor+)
exports.moderateComment = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'spam', 'trash'].includes(status)) {
      return res.status(422).json(errorResponse('Statut invalide'));
    }
    const comment = await Comment.updateStatus(parseInt(req.params.id), status);
    if (!comment) return res.status(404).json(errorResponse('Commentaire introuvable'));
    res.json(successResponse(comment, 'Statut mis a jour'));
  } catch (err) { next(err); }
};

// DELETE /api/v1/comments/:id (proprietaire ou editor+)
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(parseInt(req.params.id));
    if (!comment) return res.status(404).json(errorResponse('Commentaire introuvable'));
    const canDelete = ['admin', 'editor'].includes(req.user.role) ||
      comment.user_id === req.user.user_id;
    if (!canDelete) return res.status(403).json(errorResponse('Acces refuse'));
    await Comment.remove(comment.comment_id);
    res.json(successResponse(null, 'Commentaire supprime'));
  } catch (err) { next(err); }
};
