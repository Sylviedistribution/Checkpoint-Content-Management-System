const router = require('express').Router();
const ctrl = require('../controllers/postController');
const commentCtrl = require('../controllers/commentController');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { postRules, idParam, paginationRules, validate } = require('../middleware/validation');

router.get('/', optionalAuth, paginationRules, validate, ctrl.getPosts);
router.get('/:idOrSlug', optionalAuth, ctrl.getPost);
router.get('/:postId/comments', commentCtrl.getPostComments);

router.post('/', authenticate, authorize('admin', 'editor', 'author'), postRules, validate, ctrl.createPost);
router.put('/:id', authenticate, authorize('admin', 'editor', 'author'), idParam, validate, ctrl.updatePost);
router.delete('/:id', authenticate, authorize('admin', 'editor', 'author'), idParam, validate, ctrl.deletePost);

module.exports = router;
