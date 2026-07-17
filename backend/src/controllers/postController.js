const Post = require('../models/Post');
const ActivityLog = require('../models/ActivityLog');
const { cache } = require('../config/redis');
const {
  generateUniqueSlug, paginate, getPaginationMeta,
  successResponse, errorResponse
} = require('../utils/helpers');

const invalidatePostCache = () => cache.delPattern('posts:*');

// GET /api/v1/posts (public : uniquement 'published' sauf staff)
exports.getPosts = async (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const isStaff = req.user && ['admin', 'editor', 'author'].includes(req.user.role);
    const status = isStaff ? req.query.status : 'published';

    const cacheKey = `posts:${JSON.stringify({ ...req.query, page, limit, status })}`;
    if (!isStaff) {
      const cached = await cache.get(cacheKey);
      if (cached) return res.json(cached);
    }

    const filters = {
      limit, offset, status,
      category_id: req.query.category_id,
      tag: req.query.tag,
      search: req.query.search,
      orderBy: req.query.orderBy,
      featured: req.query.featured === 'true' ? true : undefined
    };
    // Un auteur ne voit que ses propres brouillons
    if (req.user && req.user.role === 'author' && status !== 'published') {
      filters.author_id = req.user.user_id;
    }

    const { posts, total } = await Post.findAll(filters);
    const response = successResponse(posts, 'Success', getPaginationMeta(total, page, limit));
    if (!isStaff) await cache.set(cacheKey, response, 300);
    res.json(response);
  } catch (err) { next(err); }
};

// GET /api/v1/posts/:idOrSlug
exports.getPost = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const post = /^\d+$/.test(idOrSlug)
      ? await Post.findById(parseInt(idOrSlug))
      : await Post.findBySlug(idOrSlug);

    if (!post) return res.status(404).json(errorResponse('Article introuvable'));

    const isStaff = req.user && ['admin', 'editor'].includes(req.user.role);
    const isOwner = req.user && req.user.user_id === post.author_id;
    if (post.status !== 'published' && !isStaff && !isOwner) {
      return res.status(404).json(errorResponse('Article introuvable'));
    }
    if (post.status === 'published') Post.incrementViews(post.post_id).catch(() => {});
    res.json(successResponse(post));
  } catch (err) { next(err); }
};

// POST /api/v1/posts (author+)
exports.createPost = async (req, res, next) => {
  try {
    const slug = await generateUniqueSlug(req.body.title, Post.slugExists);
    const post = await Post.create({ ...req.body, slug }, req.user.user_id);
    await ActivityLog.log({
      user_id: req.user.user_id, action: 'create_post', entity_type: 'post',
      entity_id: post.post_id, description: post.title, ip_address: req.ip
    });
    await invalidatePostCache();
    res.status(201).json(successResponse(post, 'Article cree'));
  } catch (err) { next(err); }
};

// PUT /api/v1/posts/:id (proprietaire ou editor/admin)
exports.updatePost = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Post.findById(id);
    if (!existing) return res.status(404).json(errorResponse('Article introuvable'));

    const canEdit = ['admin', 'editor'].includes(req.user.role) ||
      existing.author_id === req.user.user_id;
    if (!canEdit) return res.status(403).json(errorResponse('Acces refuse'));

    // Un auteur ne peut pas publier directement (workflow editorial)
    if (req.body.status === 'published' && req.user.role === 'author') {
      return res.status(403).json(errorResponse('Seul un editeur ou un admin peut publier'));
    }

    if (req.body.title && req.body.title !== existing.title) {
      req.body.slug = await generateUniqueSlug(req.body.title, Post.slugExists);
    }
    const post = await Post.update(id, req.body);
    await ActivityLog.log({
      user_id: req.user.user_id, action: 'update_post', entity_type: 'post',
      entity_id: id, ip_address: req.ip
    });
    await invalidatePostCache();
    res.json(successResponse(post, 'Article mis a jour'));
  } catch (err) { next(err); }
};

// DELETE /api/v1/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await Post.findById(id);
    if (!existing) return res.status(404).json(errorResponse('Article introuvable'));
    const canDelete = ['admin', 'editor'].includes(req.user.role) ||
      existing.author_id === req.user.user_id;
    if (!canDelete) return res.status(403).json(errorResponse('Acces refuse'));

    await Post.remove(id);
    await ActivityLog.log({
      user_id: req.user.user_id, action: 'delete_post', entity_type: 'post',
      entity_id: id, description: existing.title, ip_address: req.ip
    });
    await invalidatePostCache();
    res.json(successResponse(null, 'Article supprime'));
  } catch (err) { next(err); }
};
