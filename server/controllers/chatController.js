const Message = require('../models/Message');
const Match = require('../models/Match');
const { filterMessage, checkToxicity } = require('../services/toxicityFilter');

// GET /api/chat/:matchId
exports.getMessages = async (req, res) => {
  try {
    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.userId,
      $or: [{ status: 'matched' }, { status: 'pending' }]
    });

    if (!match) {
      return res.status(403).json({ error: 'Match not found or unauthorized.' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ matchId: req.params.matchId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profilePhoto');

    // Mark unread messages as read
    await Message.updateMany(
      { 
        matchId: req.params.matchId, 
        sender: { $ne: req.userId },
        readAt: null 
      },
      { readAt: new Date() }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

// POST /api/chat/:matchId
exports.sendMessage = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const match = await Match.findOne({
      _id: req.params.matchId,
      users: req.userId,
      $or: [{ status: 'matched' }, { status: 'pending' }]
    });

    if (!match) {
      return res.status(403).json({ error: 'Match not found or unauthorized.' });
    }

    if (match.status === 'pending') {
      if (match.initiator.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You cannot reply until you accept the request.' });
      }
      const msgCount = await Message.countDocuments({ matchId: req.params.matchId, sender: req.userId });
      if (msgCount >= 1) {
        return res.status(429).json({ error: 'You can only send 1 message before they accept your request.' });
      }
    }

    // Check toxicity
    const toxicityResult = checkToxicity(content);
    
    const message = new Message({
      matchId: req.params.matchId,
      sender: req.userId,
      content: toxicityResult.isToxic ? toxicityResult.cleaned : content,
      isAnonymous: isAnonymous || false,
      isFlagged: toxicityResult.isToxic
    });

    await message.save();
    await message.populate('sender', 'name profilePhoto');

    res.status(201).json({ 
      message,
      warning: toxicityResult.isToxic ? 'Your message was filtered for inappropriate content.' : null
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};
