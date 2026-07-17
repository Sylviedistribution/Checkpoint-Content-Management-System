const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { idParam, validate } = require('../middleware/validation');

router.get('/', authenticate, authorize('admin', 'editor'), ctrl.getUsers);
router.get('/:id', authenticate, idParam, validate, ctrl.getUser);
router.put('/:id', authenticate, idParam, validate, ctrl.updateUser);
router.delete('/:id', authenticate, authorize('admin'), idParam, validate, ctrl.deleteUser);

module.exports = router;
