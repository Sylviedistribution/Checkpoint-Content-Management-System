const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/stats', authenticate, authorize('admin', 'editor', 'author'), ctrl.getStats);

module.exports = router;
