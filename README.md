# Shortlist

A Next.js application for managing a job search, built with React, TypeScript, Prisma and PostgreSQL.

## Run locally

1. Install Node.js 24+ and run `npm install`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Start PostgreSQL with `docker compose up -d`, or use a hosted PostgreSQL URL.
4. Run `npx prisma generate` and `npm run db:push` for a development database.
5. Run `npm run dev` and open http://localhost:3001.

The `/demo` route works without a database. It contains labeled sample data and persists edits in sessionStorage for that browser tab. Real accounts and their data use PostgreSQL; demo data is never mixed into an account.

## Architecture

- `src/app`: App Router pages and HTTP route handlers.
- `src/components`: React UI and forms.
- `src/server`: database queries and ownership checks.
- `src/lib`: shared validation, authentication, HTTP helpers and Prisma client.
- `src/types`: serializable domain types.
- `prisma/schema.prisma`: relational schema with cascading ownership and indexes.
- `tests`: boundary validation tests.

Next.js runs on Node.js and provides the backend endpoints, so a separate Express service is not required.

## Features

Account registration, sign-in and sign-out; per-user applications; stages; company information; job descriptions; salary and location; search and stage filters; interview scheduling with local time input; notes; in-app reminders with completion; stage analytics; resume version links attached to applications; responsive dashboard; editable application details; application deletion.

Resume versions currently store hosted document URLs, not uploaded files. Reminders are in-app; email delivery and background notifications are not configured. Analytics report current stages rather than historical transitions.

## Authentication and deployment

Passwords use salted scrypt hashes. Random session tokens are hashed in the database and sent in HttpOnly, SameSite cookies (Secure in production). Every application mutation checks the signed-in owner, including linked resumes. Mutation endpoints validate request origin. Inputs use Zod.

Deploy to a Node-compatible host such as Vercel with PostgreSQL, set `DATABASE_URL`, and run `npm run build`. Run `prisma migrate deploy` against the target database as a deployment step. Do not run db:push against production. Authentication is limited to 10 attempts per email per 15-minute window using database counters. Add password reset/email verification, backups and monitoring before opening registration broadly. Periodically purge expired sessions and AuthAttempt rows.

## Checks

`npm run typecheck`, `npm test`, `npm run build`.
