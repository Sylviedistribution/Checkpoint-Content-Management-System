const router = require('express').Router();
const ctrl = require('../controllers/commentController');
const { authenticate, authorize } = require('../middleware/auth');
const { commentRules, idParam, validate } = require('../middleware/validation');

router.get('/', authenticate, authorize('admin', 'editor'), ctrl.getComments);
router.post('/', authenticate, commentRules, validate, ctrl.createComment);
router.patch('/:id/status', authenticate, authorize('admin', 'editor'), idParam, validate, ctrl.moderateComment);
router.delete('/:id', authenticate, idParam, validate, ctrl.deleteComment);

module.exports = router;
