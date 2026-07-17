const router = require('express').Router();
const ctrl = require('../controllers/mediaController');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const { idParam, validate } = require('../middleware/validation');

router.get('/', authenticate, ctrl.getMedia);
router.post('/', authenticate, authorize('admin', 'editor', 'author'), upload.single('file'), ctrl.uploadMedia);
router.delete('/:id', authenticate, authorize('admin', 'editor'), idParam, validate, ctrl.deleteMedia);

module.exports = router;
