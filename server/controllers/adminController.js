const User = require('../models/User');
const Report = require('../models/Report');
const Match = require('../models/Match');
const Message = require('../models/Message');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, bannedUsers, totalMatches, totalMessages, pendingReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isBanned: true }),
      Match.countDocuments({ status: 'matched' }),
      Message.countDocuments(),
      Report.countDocuments({ status: 'pending' })
    ]);
    const deptStats = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const yearStats = await User.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    res.json({ stats: { totalUsers, verifiedUsers, bannedUsers, totalMatches, totalMessages, pendingReports, recentSignups, deptStats, yearStats } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    const [users, total] = await Promise.all([
      User.find(query).select('-password -__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

exports.toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isBanned = !user.isBanned;
    await user.save({ validateModifiedOnly: true });
    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`, user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isVerified = true;
    user.verificationBadge = true;
    await user.save({ validateModifiedOnly: true });
    res.json({ message: 'User verified.', user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify user.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const reports = await Report.find({ status })
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email department')
      .sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, {
      status, adminNotes: adminNotes || '',
      resolvedAt: ['resolved', 'dismissed'].includes(status) ? new Date() : null
    }, { new: true }).populate('reporter', 'name').populate('reportedUser', 'name');
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json({ message: 'Report updated.', report });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update report.' });
  }
};
