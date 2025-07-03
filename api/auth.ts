// TODO: Adapt any auth, JWT, Google OAuth, and email logic as needed
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { z } from 'zod';
// import { sendVerificationEmail, sendPasswordResetEmail, generateToken } from '../utils/email';
// import { OAuth2Client } from 'google-auth-library';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req, res) {
  const { method, url, query, body, headers } = req;

  // POST /api/auth/register
  if (method === 'POST' && url.includes('/register')) {
    // TODO: Implement user registration logic
    return res.status(501).json({ error: 'Not implemented: register' });
  }

  // POST /api/auth/login
  if (method === 'POST' && url.includes('/login')) {
    // TODO: Implement user login logic
    return res.status(501).json({ error: 'Not implemented: login' });
  }

  // POST /api/auth/verify-email
  if (method === 'POST' && url.includes('/verify-email')) {
    // TODO: Implement email verification logic
    return res.status(501).json({ error: 'Not implemented: verify email' });
  }

  // TODO: Add more endpoints as needed (password reset, Google OAuth, etc.)

  res.status(404).json({ error: 'Not found' });
} 