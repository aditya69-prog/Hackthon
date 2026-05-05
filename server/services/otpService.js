const nodemailer = require('nodemailer');

// In-memory OTP store (in production, use Redis)
const otpStore = new Map();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000);
  
  otpStore.set(email, { otp, expiresAt });

  // If email config is missing, fallback to console log (useful for testing if they haven't set it up yet)
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`[DEV MODE] 📧 OTP for ${email}: ${otp}`);
    return otp;
  }

  // Send real email
  try {
    await transporter.sendMail({
      from: `"RNS Connect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your RNS Connect Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Welcome to RNS Connect!</h2>
          <p style="color: #555; font-size: 16px;">Here is your verification code. It will expire in 5 minutes.</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
    console.log(`📧 Real email OTP sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
  
  return null; // Don't return the OTP
};

const verifyOTP = (email, otp) => {
  const stored = otpStore.get(email);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found. Please request a new one.' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP.' };
  }
  
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully.' };
};

module.exports = { sendOTP, verifyOTP };
