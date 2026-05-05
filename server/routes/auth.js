const router = require('express').Router();
const { signup, login, sendOTPHandler, verifyOTPHandler, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/send-otp', authLimiter, sendOTPHandler);
router.post('/verify-otp', authLimiter, verifyOTPHandler);
router.get('/me', auth, getMe);

module.exports = router;
