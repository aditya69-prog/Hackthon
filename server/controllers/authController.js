const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../services/otpService');

// Validate RNSIT USN format: 1RNxxYYxxx (e.g., 1RN21CS001)
const isValidUSN = (usn) => {
  const usnRegex = /^1RN\d{2}[A-Z]{2,4}\d{3}$/i;
  return usnRegex.test(usn);
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, email, usn, password, department, year } = req.body;

    // Validate required fields
    if (!name || !email || !usn || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate USN format
    if (!isValidUSN(usn)) {
      return res.status(400).json({ error: 'Invalid USN format. Must be RNSIT format (e.g., 1RN21CS001).' });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { usn: usn.toUpperCase() }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or USN already exists.' });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      usn: usn.toUpperCase(),
      password,
      department: department || 'CSE',
      year: year || 1
    });

    await user.save();

    // Send OTP for verification
    const otp = await sendOTP(email.toLowerCase());

    const tokens = generateTokens(user._id);

    const responsePayload = {
      message: 'Account created! Please verify your email with the OTP sent.',
      user: user.toPublicJSON(),
      ...tokens
    };
    if (otp) responsePayload.otp = otp; // Only present in DEV mode

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email or USN already registered.' });
    }
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Your account has been suspended. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const tokens = generateTokens(user._id);

    res.json({
      message: 'Login successful!',
      user: user.toPublicJSON(),
      ...tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/send-otp
exports.sendOTPHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const otp = await sendOTP(email.toLowerCase());

    const responsePayload = { message: 'OTP sent successfully!' };
    if (otp) responsePayload.otp = otp; // Only present in DEV mode

    res.json(responsePayload);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const result = verifyOTP(email.toLowerCase(), otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    // Mark user as verified
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true, verificationBadge: true }
    );

    res.json({ message: 'Email verified successfully! Your account is now active.' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};
