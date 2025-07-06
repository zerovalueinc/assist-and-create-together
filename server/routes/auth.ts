// @ts-nocheck
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, generateToken } from '../utils/email.js';
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://hbogcsztrryrepudceww.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions to replace database/init functions
async function getRow(table: string, conditions: Record<string, any>) {
  let query = supabase.from(table).select('*');
  for (const [key, value] of Object.entries(conditions)) {
    query = query.eq(key, value);
  }
  const { data, error } = await query.single();
  if (error) throw error;
  return data;
}

async function runQuery(query: string, params: any[] = []) {
  // For Supabase, we'll use RPC for custom queries or direct table operations
  // This is a simplified implementation - adjust based on your needs
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: query, params });
  if (error) throw error;
  return data;
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});

const emailVerificationSchema = z.object({
  token: z.string(),
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateJWT(user: { id: number; email: string; role?: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await getRow('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await runQuery(
      `INSERT INTO users (email, passwordHash, firstName, lastName, company, emailVerificationToken, emailVerificationExpires) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName, company, verificationToken, verificationExpires.toISOString()]
    );

    const userId = result.lastID;

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, firstName);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    console.log(`👤 Created user: ${email} (ID: ${userId})`);
    res.status(201).json({ message: 'User registered successfully', user: { id: userId, email: email } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Get user
    const user = await getRow(
      'SELECT id, email, passwordHash, firstName, lastName, emailVerified, failedLoginAttempts FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(401).json({ 
        error: 'Email not verified. Please check your email and click the verification link.',
        requiresVerification: true 
      });
      return;
    }

    // Check if account is locked (more than 5 failed attempts)
    if (user.failedLoginAttempts >= 5) {
      res.status(401).json({ error: 'Account temporarily locked due to too many failed login attempts' });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      await runQuery(
        'UPDATE users SET failedLoginAttempts = failedLoginAttempts + 1 WHERE id = ?',
        [user.id]
      );
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Reset failed login attempts and update last login
    await runQuery(
      'UPDATE users SET failedLoginAttempts = 0, lastLogin = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateJWT(user);

    console.log(`🔐 User logged in: ${email} (ID: ${user.id})`);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = emailVerificationSchema.parse(req.body);

    // Find user with this token
    const user = await getRow(
      'SELECT id, email, emailVerificationExpires FROM users WHERE emailVerificationToken = ?',
      [token]
    );

    if (!user) {
      res.status(400).json({ error: 'Invalid verification token' });
      return;
    }

    // Check if token is expired
    if (new Date(user.emailVerificationExpires) < new Date()) {
      res.status(400).json({ error: 'Verification token has expired' });
      return;
    }

    // Mark email as verified and clear token
    await runQuery(
      'UPDATE users SET emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?',
      [user.id]
    );

    console.log(`✅ Email verified for user: ${user.email} (ID: ${user.id})`);
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);

    // Find user
    const user = await getRow('SELECT id, email, firstName FROM users WHERE email = ?', [email]);
    if (!user) {
      // Don't reveal if user exists or not
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await runQuery(
      'UPDATE users SET passwordResetToken = ?, passwordResetExpires = ? WHERE id = ?',
      [resetToken, resetExpires.toISOString(), user.id]
    );

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.firstName);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      res.status(500).json({ error: 'Failed to send password reset email' });
      return;
    }

    console.log(`📧 Password reset requested for: ${email} (ID: ${user.id})`);
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Password reset request error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = passwordResetSchema.parse(req.body);

    // Find user with this token
    const user = await getRow(
      'SELECT id, email, passwordResetExpires FROM users WHERE passwordResetToken = ?',
      [token]
    );

    if (!user) {
      res.status(400).json({ error: 'Invalid reset token' });
      return;
    }

    // Check if token is expired
    if (new Date(user.passwordResetExpires) < new Date()) {
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await runQuery(
      'UPDATE users SET passwordHash = ?, passwordResetToken = NULL, passwordResetExpires = NULL, failedLoginAttempts = 0 WHERE id = ?',
      [passwordHash, user.id]
    );

    console.log(`🔐 Password reset for user: ${user.email} (ID: ${user.id})`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input data', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getRow(
      'SELECT id, email, firstName, lastName, company, role, emailVerified, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    // Find or create user
    let user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Insert with a dummy passwordHash for Google users
      const result = await runQuery(
        'INSERT INTO users (email, firstName, lastName, emailVerified, passwordHash) VALUES (?, ?, ?, 1, ?)',
        [email, firstName, lastName, 'GOOGLE_OAUTH']
      );
      user = await getRow('SELECT * FROM users WHERE id = ?', [result.lastID]);
    }
    // Robust check for user existence
    if (!user) {
      console.error('Failed to fetch user after Google insert');
      return res.status(500).json({ error: 'Failed to create user' });
    }
    console.log('Google user for JWT:', user);
    // Generate JWT
    const token = generateJWT(user);
    res.json({ user, token });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(401).json({ error: 'Invalid Google credential' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const profileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
  });
  try {
    const { firstName, lastName, company } = profileSchema.parse(req.body);
    await runQuery(
      'UPDATE users SET firstName = ?, lastName = ?, company = ? WHERE id = ?',
      [firstName, lastName, company, req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid profile update', details: error instanceof z.ZodError ? error.errors : error });
  }
});

// Change password
router.put('/security', authenticateToken, async (req, res) => {
  const passwordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const user = await getRow('SELECT passwordHash FROM users WHERE id = ?', [req.user.id]);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await runQuery('UPDATE users SET passwordHash = ? WHERE id = ?', [newHash, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid password change', details: error instanceof z.ZodError ? error.errors : error });
  }
});

// Notification preferences (mock, extend as needed)
router.get('/notifications', authenticateToken, async (req, res) => {
  // TODO: Fetch from DB if you store notification prefs
  res.json({ notifications: { email: true, sms: false } });
});
router.put('/notifications', authenticateToken, async (req, res) => {
  // TODO: Save to DB if you store notification prefs
  res.json({ success: true });
});

// User preferences (mock, extend as needed)
router.get('/preferences', authenticateToken, async (req, res) => {
  // TODO: Fetch from DB if you store user prefs
  res.json({ preferences: { darkMode: false, language: 'en' } });
});
router.put('/preferences', authenticateToken, async (req, res) => {
  // TODO: Save to DB if you store user prefs
  res.json({ success: true });
});

// Fix middleware to return void
router.use('/protected', authenticateToken, (req, res, next) => {
  next();
});

export default router; 