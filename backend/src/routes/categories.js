const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const { categoryRules, idParam, validate } = require('../middleware/validation');

router.get('/', ctrl.getCategories);
router.get('/:id', idParam, validate, ctrl.getCategory);
router.post('/', authenticate, authorize('admin', 'editor'), categoryRules, validate, ctrl.createCategory);
router.put('/:id', authenticate, authorize('admin', 'editor'), idParam, validate, ctrl.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), idParam, validate, ctrl.deleteCategory);

module.exports = router;
