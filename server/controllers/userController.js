const User = require('../models/User');
const Report = require('../models/Report');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'department', 'year', 'interests', 'skills', 'intent', 'profilePhoto', 'privacySettings'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Check if profile is now complete
    const user = await User.findById(req.userId);
    const updatedUser = { ...user.toObject(), ...updates };
    if (updatedUser.name && updatedUser.bio && updatedUser.department && updatedUser.year && 
        updatedUser.interests?.length > 0 && updatedUser.intent) {
      updates.profileCompleted = true;
    }

    const updated = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    
    res.json({ 
      message: 'Profile updated!', 
      user: updated.toPublicJSON() 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -usn -blockedUsers -__v');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isBanned) return res.status(404).json({ error: 'User not found.' });
    if (!user.privacySettings.showProfile) return res.status(403).json({ error: 'This profile is private.' });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// POST /api/users/block/:id
exports.blockUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.userId.toString()) {
      return res.status(400).json({ error: "You can't block yourself." });
    }

    await User.findByIdAndUpdate(req.userId, {
      $addToSet: { blockedUsers: targetId }
    });

    res.json({ message: 'User blocked.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user.' });
  }
};

// POST /api/users/unblock/:id
exports.unblockUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { blockedUsers: req.params.id }
    });
    res.json({ message: 'User unblocked.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
};

// POST /api/users/report/:id
exports.reportUser = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const targetId = req.params.id;

    if (!reason) return res.status(400).json({ error: 'Reason is required.' });

    const report = new Report({
      reporter: req.userId,
      reportedUser: targetId,
      reason,
      description: description || ''
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted. Our team will review it.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit report.' });
  }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
};
