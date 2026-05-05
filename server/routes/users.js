const router = require('express').Router();
const { getProfile, updateProfile, getUserById, blockUser, unblockUser, reportUser, deleteAccount } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/:id', auth, getUserById);
router.post('/block/:id', auth, blockUser);
router.post('/unblock/:id', auth, unblockUser);
router.post('/report/:id', auth, reportUser);
router.delete('/account', auth, deleteAccount);

module.exports = router;
