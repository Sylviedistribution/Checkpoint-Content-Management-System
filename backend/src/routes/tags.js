const router = require('express').Router();
const ctrl = require('../controllers/tagController');
const { authenticate, authorize } = require('../middleware/auth');
const { tagRules, idParam, validate } = require('../middleware/validation');

router.get('/', ctrl.getTags);
router.post('/', authenticate, authorize('admin', 'editor', 'author'), tagRules, validate, ctrl.createTag);
router.put('/:id', authenticate, authorize('admin', 'editor'), idParam, validate, ctrl.updateTag);
router.delete('/:id', authenticate, authorize('admin'), idParam, validate, ctrl.deleteTag);

module.exports = router;
