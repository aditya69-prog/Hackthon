const router = require('express').Router();
const { getStats, getUsers, toggleBan, verifyUser, getReports, resolveReport } = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.use(auth, adminAuth);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBan);
router.put('/users/:id/verify', verifyUser);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

module.exports = router;
