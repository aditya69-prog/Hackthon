const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  usn: {
    type: String,
    required: [true, 'USN is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  department: {
    type: String,
    enum: ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CE', 'AE', 'BT', 'MBA', 'MCA', 'AI&ML', 'AI&DS', 'Other'],
    default: 'CSE'
  },
  year: {
    type: Number,
    enum: [1, 2, 3, 4],
    default: 1
  },
  bio: {
    type: String,
    maxlength: 300,
    default: ''
  },
  interests: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  intent: {
    type: String,
    enum: ['friends', 'study', 'relationship', 'all'],
    default: 'friends'
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: Boolean,
    default: false
  },
  privacySettings: {
    showProfile: { type: Boolean, default: true },
    showDepartment: { type: Boolean, default: true },
    showYear: { type: Boolean, default: true }
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  premiumExpiresAt: {
    type: Date,
    default: null
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  swipesLeft: {
    type: Number,
    default: 10
  },
  lastSwipeReset: {
    type: Date,
    default: Date.now
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profileCompleted: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Reset daily swipes
userSchema.methods.resetSwipesIfNeeded = function () {
  const now = new Date();
  const lastReset = new Date(this.lastSwipeReset);
  if (now.toDateString() !== lastReset.toDateString()) {
    this.swipesLeft = this.isPremium ? 999 : 10;
    this.lastSwipeReset = now;
    return true;
  }
  return false;
};

// Never return password or USN in JSON
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.usn;
  delete obj.blockedUsers;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
