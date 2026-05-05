const Match = require('../models/Match');
const User = require('../models/User');
const Message = require('../models/Message');
const { getRecommendedProfiles } = require('../services/matchingEngine');

// GET /api/matches/discover
exports.discover = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Reset swipes if new day
    if (user.resetSwipesIfNeeded()) {
      await user.save({ validateModifiedOnly: true });
    }

    if (user.swipesLeft <= 0 && !user.isPremium) {
      return res.status(429).json({ 
        error: 'Daily swipe limit reached! Upgrade to premium for unlimited swipes.',
        swipesLeft: 0
      });
    }

    // Get IDs of users already swiped on
    const existingSwipes = await Match.find({
      initiator: req.userId
    }).select('users');
    
    const swipedIds = existingSwipes.flatMap(m => 
      m.users.filter(u => u.toString() !== req.userId.toString())
    );

    // Get recommended profiles
    const profiles = await getRecommendedProfiles(req.userId, req.query);

    // Filter out already-swiped profiles
    const filtered = profiles.filter(p => 
      !swipedIds.some(id => id.toString() === p._id.toString())
    );

    res.json({ 
      profiles: filtered.slice(0, 20),
      swipesLeft: user.swipesLeft
    });
  } catch (error) {
    console.error('Discover error:', error);
    res.status(500).json({ error: 'Failed to load profiles.' });
  }
};

// POST /api/matches/swipe
exports.swipe = async (req, res) => {
  try {
    const { targetId, action } = req.body; // action: 'like' or 'pass'
    
    if (!targetId || !action) {
      return res.status(400).json({ error: 'Target user and action required.' });
    }

    if (targetId === req.userId.toString()) {
      return res.status(400).json({ error: "You can't swipe on yourself." });
    }

    const user = await User.findById(req.userId);

    // Check swipe limit
    if (user.resetSwipesIfNeeded()) {
      await user.save({ validateModifiedOnly: true });
    }

    if (user.swipesLeft <= 0 && !user.isPremium) {
      return res.status(429).json({ error: 'Daily swipe limit reached!' });
    }

    // Decrement swipes
    user.swipesLeft -= 1;
    await user.save({ validateModifiedOnly: true });

    if (action === 'pass') {
      // Record the pass to exclude from future discover
      const passMatch = new Match({
        users: [req.userId, targetId],
        initiator: req.userId,
        status: 'unmatched'
      });
      await passMatch.save();

      return res.json({ 
        matched: false, 
        message: 'Passed.',
        swipesLeft: user.swipesLeft
      });
    }

    // Action is 'like'
    // Check if target already liked current user
    const existingLike = await Match.findOne({
      initiator: targetId,
      users: { $all: [req.userId, targetId] },
      status: 'pending'
    });

    if (existingLike) {
      // MUTUAL MATCH!
      existingLike.status = 'matched';
      existingLike.matchedAt = new Date();
      await existingLike.save();

      // Populate users for response
      await existingLike.populate('users', 'name department year profilePhoto bio');

      return res.json({ 
        matched: true, 
        message: "It's a match! 🎉",
        match: existingLike,
        swipesLeft: user.swipesLeft
      });
    }

    // No existing like from target — create pending match
    const newMatch = new Match({
      users: [req.userId, targetId],
      initiator: req.userId,
      status: 'pending'
    });
    await newMatch.save();

    res.json({ 
      matched: false, 
      message: 'Like recorded!',
      swipesLeft: user.swipesLeft
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to process swipe.' });
  }
};

// GET /api/matches
exports.getMatches = async (req, res) => {
  try {
    // Fetch both matched friends and pending outgoing requests (to allow the 1 message)
    const matches = await Match.find({
      users: req.userId,
      $or: [
        { status: 'matched' },
        { status: 'pending', initiator: req.userId }
      ]
    })
    .populate('users', 'name department year profilePhoto bio lastActive')
    .sort({ matchedAt: -1, createdAt: -1 });

    // Fetch last message for each match
    const formatted = await Promise.all(matches.map(async (match) => {
      const otherUser = match.users.find(u => u._id.toString() !== req.userId.toString());
      const lastMessage = await Message.findOne({ matchId: match._id }).sort({ createdAt: -1 });

      return {
        _id: match._id,
        user: otherUser,
        status: match.status,
        matchedAt: match.matchedAt,
        createdAt: match.createdAt,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          sender: lastMessage.sender,
          createdAt: lastMessage.createdAt
        } : null
      };
    }));

    // Sort by last message time if it exists, otherwise matchedAt/createdAt
    formatted.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.matchedAt || a.createdAt).getTime();
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.matchedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    res.json({ matches: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
};

// GET /api/matches/requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await Match.find({
      users: req.userId,
      initiator: { $ne: req.userId },
      status: 'pending'
    })
    .populate('initiator', 'name department year bio interests skills profilePhoto')
    .sort({ createdAt: -1 });

    const formatted = requests.map(reqMatch => ({
      _id: reqMatch._id,
      user: reqMatch.initiator,
      createdAt: reqMatch.createdAt
    }));

    res.json({ requests: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// PUT /api/matches/requests/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      users: req.userId,
      status: 'pending'
    });
    if (!match) return res.status(404).json({ error: 'Request not found.' });

    match.status = 'matched';
    match.matchedAt = new Date();
    await match.save();

    res.json({ message: 'Request accepted!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept request.' });
  }
};

// PUT /api/matches/requests/:id/decline
exports.declineRequest = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      users: req.userId,
      status: 'pending'
    });
    if (!match) return res.status(404).json({ error: 'Request not found.' });

    match.status = 'unmatched';
    await match.save();

    res.json({ message: 'Request declined.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline request.' });
  }
};

// DELETE /api/matches/:id
exports.unmatch = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.id,
      users: req.userId,
      status: 'matched'
    });

    if (!match) return res.status(404).json({ error: 'Match not found.' });

    match.status = 'unmatched';
    await match.save();

    res.json({ message: 'Unmatched successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unmatch.' });
  }
};
