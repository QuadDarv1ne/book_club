-- Migration: add tables according to schema.prisma (safe CREATE IF NOT EXISTS)
-- NOTE: Requires PostgreSQL. This migration creates tables if they don't exist.

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  "emailVerified" TIMESTAMP,
  image TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Book" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "bookId" TEXT,
  "userId" TEXT
);

ALTER TABLE "Review" ADD CONSTRAINT IF NOT EXISTS fk_review_book FOREIGN KEY ("bookId") REFERENCES "Book"(id) ON DELETE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT IF NOT EXISTS fk_review_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "Club" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Membership" (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "userId" TEXT,
  "clubId" TEXT
);

ALTER TABLE "Membership" ADD CONSTRAINT IF NOT EXISTS fk_membership_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT IF NOT EXISTS fk_membership_club FOREIGN KEY ("clubId") REFERENCES "Club"(id) ON DELETE CASCADE;

-- NextAuth tables
CREATE TABLE IF NOT EXISTS "Account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS account_provider_providerAccountId_idx ON "Account" (provider, "providerAccountId");
ALTER TABLE "Account" ADD CONSTRAINT IF NOT EXISTS fk_account_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE,
  "userId" TEXT,
  expires TIMESTAMP
);
ALTER TABLE "Session" ADD CONSTRAINT IF NOT EXISTS fk_session_user FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  identifier TEXT,
  token TEXT UNIQUE,
  expires TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS verificationtoken_identifier_token_idx ON "VerificationToken" (identifier, token);
