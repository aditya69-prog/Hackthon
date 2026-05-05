const router = require('express').Router();
const { discover, swipe, getMatches, unmatch, getRequests, acceptRequest, declineRequest } = require('../controllers/matchController');
const { auth } = require('../middleware/auth');
const { swipeLimiter } = require('../middleware/rateLimiter');

router.get('/discover', auth, discover);
router.post('/swipe', auth, swipeLimiter, swipe);
router.get('/', auth, getMatches);
router.get('/requests', auth, getRequests);
router.put('/requests/:id/accept', auth, acceptRequest);
router.put('/requests/:id/decline', auth, declineRequest);
router.delete('/:id', auth, unmatch);

module.exports = router;
