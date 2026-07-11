# Assessment Management

A MERN app for building structured assessments, sharing them via a public link, and reviewing
responses. Admins log in to build and manage assessments; **respondents take published assessments
from a public link without logging in**, identifying themselves with just a name and email.

## 🔗 Try it live

**https://assessment-client-1cc0ee.vercel.app**

Register an account (any email/password) to build assessments, publish one, then open its public
share link to take it — no login needed for respondents.

> **Heads up — first request may be slow.** The backend runs on Render's free tier, which spins
> down idle containers. The **first** request after a period of inactivity can take **30–60 seconds**
> while the server wakes up (login or page load may hang, then succeed). It's not broken — give it a
> moment and retry. Once warm, it's snappy.

## Features

- **Auth** — email/password register & login (JWT in an httpOnly cookie) guarding the admin area.
- **Builder** — accordion hierarchy **Category → Factor → Question**; question types: multiple
  choice, rating scale, yes/no, open text. Inline editing throughout.
- **Load Categories** — reuse categories from your saved assessments (deep-cloned with fresh ids).
- **Assessments / Launch Pad** — publish/unpublish, delete, and copy a public share link.
- **Take Assessment (public)** — `/take/:id`, no login; submit answers with name + email. Multiple
  submissions per email allowed.
- **Reports** — per-assessment submissions with answers in the original hierarchy and simple
  aggregate metrics.

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Client:** React 19, Vite, React Router 7, Tailwind CSS v4, TypeScript (deployed on Vercel)
- **Server:** Express 5, Mongoose 9 (MongoDB), TypeScript (deployed on Render)
- **Auth:** JWT + bcryptjs, httpOnly cookie

## Run locally

Requires Node ≥ 18, pnpm 10 (`corepack enable`), and a MongoDB instance.

```bash
pnpm install

# Server env
cp apps/server/.env.example apps/server/.env
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/assessment-management
#   JWT_SECRET=<a long random string>

# Client env (defaults are fine)
cp apps/client/.env.example apps/client/.env

pnpm dev
```

- Client: http://localhost:3000 · Server: http://localhost:5000
- The Vite dev server proxies `/api` to the backend, so cookies and CORS work out of the box.

Other scripts: `pnpm build`, `pnpm check-types`, `pnpm lint`.

## Architecture notes

- **Public vs. admin API.** Admin CRUD lives under `/api/assessments` (behind `requireAuth`).
  Taking an assessment is a separate, unauthenticated router at `/api/public`. The public GET
  returns 404 for drafts or unknown ids, so unpublished work is never exposed via a guessed link.
- **Responses are decoupled from user accounts.** A `Response` stores the respondent's name/email
  (no `User` ref, no uniqueness constraint) — every submission is its own record.
- **Categories are copied, not linked.** "Load Categories" deep-clones selected categories with
  fresh ids, so edits never mutate the source.

## AI usage

Built with **Claude Code** (Anthropic) for planning, implementation, and code review. The initial
MERN scaffold (auth, builder, dashboard, reports) was AI-generated; the public taker flow, the
`/api/public` router, decoupled responses, "Load Categories", share-link actions, and UI
simplification were implemented with Claude Code and verified manually (typecheck + end-to-end run
of the build → publish → take → reports loop).
