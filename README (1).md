# ohneflow

A study planner built to help students who feel overwhelmed: track assignments by subject, get an AI coach that
teaches instead of doing the work, stay on schedule with reminders and a calendar, and build study habits.

## Features
- **Accounts:** secure sign-up/login, password reset by email, profile and time-zone settings, account deletion
- **Subjects:** custom subjects with color, icon, teacher, classroom; per-subject dashboard with progress, deadlines, recommendations
- **Assignments:** title, description, notes, due date, priority, status, estimated time; sort and filter; one-click complete
- **Calendar:** month, week and day views
- **Reminders and notifications:** default 1-day-before alert, custom offsets via API, in-app bell, optional email
- **AI study assistant:** subject-aware chat and a "Help me start" roadmap per assignment; tutoring tone, no finished homework
- **Google Classroom:** read-only OAuth import of courses and assignments, manual sync, status, disconnect
- **Grades:** manual entry and CSV import, per-subject averages, estimated GPA, AI improvement advice
- **Analytics:** completion, productivity trend, workload by subject, 14-day forecast, grade trend, study-time estimates
- **Study tools:** Pomodoro timer, study streaks, achievement badges
- **Notes:** Markdown notes, subject folders, search, pinning, links to assignments
- **UI:** light and dark mode, responsive, keyboard and screen-reader friendly

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · PostgreSQL + Prisma · NextAuth (credentials, JWT sessions) · zod

## Quick start (local)
```bash
cp .env.example .env          # then fill it in (see below)
npm install
npx prisma migrate dev --name init
npm run dev                   # http://localhost:3000
```
Required to start: `DATABASE_URL`, `NEXTAUTH_SECRET` (32+ chars), `NEXTAUTH_URL`.
Generate secrets with `openssl rand -base64 32`. Get a free Postgres database from Neon or Supabase.

## Environment variables
| Variable | Needed for |
|---|---|
| `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Required |
| `TOKEN_ENCRYPTION_KEY` | Google Classroom (encrypts OAuth tokens; 32 bytes, base64) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google Classroom, see `docs/GOOGLE_SETUP.md` |
| `ANTHROPIC_API_KEY`, `AI_MODEL` (optional) | AI assistant and Help me start |
| `RESEND_API_KEY`, `EMAIL_FROM` | Reminder and password-reset emails |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limits shared across servers (recommended in production) |
| `CRON_SECRET` | Protects the daily reminder job |
| `JUPITER_ENABLED`, `JUPITER_API_BASE` | Leave off unless JupiterEd grants official API access |

Features whose keys are missing simply stay unavailable; the rest of the app works.

## Deploy (GitHub + Vercel)
1. Push this repo to GitHub (never commit `.env`).
2. Vercel -> **Add New Project** -> import the repo.
3. Add the environment variables above (set `NEXTAUTH_URL` to your Vercel URL).
4. Create the database tables once: with `DATABASE_URL` pointing at production, run `npx prisma migrate deploy`
   (run `npx prisma migrate dev --name init` locally first so a `prisma/migrations` folder exists, and commit it).
5. Deploy. `vercel.json` registers a daily reminder job (`/api/cron/reminders`); Vercel's free plan allows daily runs only.
6. For Google Classroom, add your production callback URL in Google Cloud (see `docs/GOOGLE_SETUP.md`).

## Security
- Passwords hashed with bcrypt (cost 12); JWT sessions in httpOnly cookies; login and reset flows rate-limited
- Every API route checks the session, rate-limits, validates input with zod, and scopes every query to the signed-in user
- Prisma parameterized queries (no raw SQL); Markdown rendered as React elements (no raw HTML), so notes can't inject scripts
- CSP and other security headers; OAuth tokens encrypted at rest (AES-256-GCM); read-only Google scopes
- Password-reset tokens are random, stored hashed, single-use, and expire in 1 hour
- Role check helper (`guardAdmin`) for admin-only routes

## JupiterEd
No public JupiterEd API or approved sign-in flow was found, and collecting school passwords to scrape pages is not done here.
Use manual entry or CSV import on the Grades page. The code in `src/server/integrations/grades/provider.ts` is ready to
connect to an official API if one becomes available.

## Project layout
```
prisma/schema.prisma        database models
src/app/(auth)              login, register, forgot/reset password
src/app/(app)               dashboard, assignments, subjects, calendar, assistant, grades, analytics, notes, study, integrations, settings
src/app/api                 REST routes (auth, users, subjects, assignments, notes, reminders, grades, analytics, ai, study, integrations, notifications, cron, admin)
src/components              UI components, charts, calendar, Pomodoro
src/server                  services, AI, integrations, security helpers
docs/                       architecture plan, Google setup
```

## Known limits
- Analytics weeks/days are computed in UTC (study streaks use your saved time zone)
- Attachments exist in the database schema but file upload isn't wired up (needs object storage such as S3 or Vercel Blob)
- Google Classroom syncs on demand ("Sync now"), not automatically
- The Content-Security-Policy allows inline scripts/styles (a Next.js requirement without nonces)
- The code has not been through an automated test suite; run `npm run build` and click through each page after deploying
