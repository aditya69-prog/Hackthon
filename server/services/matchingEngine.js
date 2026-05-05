const User = require('../models/User');

/**
 * Basic AI-like matching engine
 * Scores profiles based on compatibility factors
 */
const calculateCompatibility = (currentUser, candidateUser) => {
  let score = 0;

  // Interest overlap (0-40 points)
  if (currentUser.interests.length > 0 && candidateUser.interests.length > 0) {
    const commonInterests = currentUser.interests.filter(i =>
      candidateUser.interests.map(x => x.toLowerCase()).includes(i.toLowerCase())
    );
    score += Math.min(commonInterests.length * 10, 40);
  }

  // Skills overlap for project matching (0-30 points)
  if (currentUser.skills.length > 0 && candidateUser.skills.length > 0) {
    const commonSkills = currentUser.skills.filter(s =>
      candidateUser.skills.map(x => x.toLowerCase()).includes(s.toLowerCase())
    );
    score += Math.min(commonSkills.length * 10, 30);
  }

  // Intent compatibility (0-20 points)
  if (currentUser.intent === candidateUser.intent || 
      currentUser.intent === 'all' || 
      candidateUser.intent === 'all') {
    score += 20;
  }

  // Same department bonus (5 points)
  if (currentUser.department === candidateUser.department) {
    score += 5;
  }

  // Different year bonus — encourages cross-year connections (5 points)
  if (currentUser.year !== candidateUser.year) {
    score += 5;
  }

  // Add some randomness to avoid predictable ordering (0-10)
  score += Math.random() * 10;

  return Math.round(score);
};

const getRecommendedProfiles = async (userId, filters = {}) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) return [];

  // Build query to exclude: self, blocked, banned, unverified, hidden profiles
  const query = {
    _id: { 
      $ne: userId,
      $nin: currentUser.blockedUsers || []
    },
    isBanned: false,
    isVerified: true,
    profileCompleted: true,
    'privacySettings.showProfile': true
  };

  // Apply filters
  if (filters.department) {
    query.department = filters.department;
  }
  if (filters.year) {
    query.year = parseInt(filters.year);
  }
  if (filters.intent) {
    query.intent = { $in: [filters.intent, 'all'] };
  }

  // Fetch candidates
  const candidates = await User.find(query)
    .select('-password -usn -blockedUsers -__v')
    .limit(50);

  // Score and sort by compatibility
  const scored = candidates.map(candidate => ({
    user: candidate,
    score: calculateCompatibility(currentUser, candidate)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.map(s => s.user);
};

module.exports = { getRecommendedProfiles, calculateCompatibility };
