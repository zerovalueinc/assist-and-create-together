CREATE TABLE IF NOT EXISTS "saved_reports" (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, companyName TEXT, url TEXT, icpId INTEGER, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (icpId) REFERENCES icps(id) ON DELETE SET NULL);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, passwordHash TEXT NOT NULL, firstName TEXT, lastName TEXT, company TEXT, role TEXT DEFAULT 'user', isActive BOOLEAN DEFAULT 1, emailVerified BOOLEAN DEFAULT 0, emailVerificationToken TEXT, emailVerificationExpires DATETIME, passwordResetToken TEXT, passwordResetExpires DATETIME, failedLoginAttempts INTEGER DEFAULT 0, lastLogin DATETIME, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE icps (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER NOT NULL, industry TEXT, funding TEXT, painPoints TEXT, persona TEXT, technologies TEXT, validUseCase TEXT, companySize TEXT, jobTitles TEXT, locationCountry TEXT, industries TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE);

-- Company Analyses Table
CREATE TABLE IF NOT EXISTS company_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  analysis_result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, website_url)
);

-- ICP Analyses Table
CREATE TABLE IF NOT EXISTS icp_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  icp_result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, website_url)
);

-- Playbook Analyses Table
CREATE TABLE IF NOT EXISTS playbook_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  icp jsonb NOT NULL,
  playbook_result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, website_url, icp)
);
