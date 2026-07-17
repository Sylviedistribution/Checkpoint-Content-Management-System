const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validation');

// Limitation stricte sur les routes sensibles (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives, reessayez dans 15 minutes' }
});

router.post('/register', authLimiter, registerRules, validate, ctrl.register);
router.post('/login', authLimiter, loginRules, validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.get('/me', authenticate, ctrl.me);
router.post('/change-password', authenticate, ctrl.changePassword);

module.exports = router;
