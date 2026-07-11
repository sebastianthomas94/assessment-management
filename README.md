# Assessment Management

A MERN application for building structured assessments, sharing them, collecting responses, and
reviewing results. Admins log in to build and manage assessments; **respondents take published
assessments from a public link without logging in**, identifying themselves with only a name and
email at submission.

## Features

- **Authentication** — email/password register & login (JWT in an httpOnly cookie). Guards the
  admin area (Builder, Assessments, Launch Pad, Reports).
- **Builder** — accordion hierarchy **Category → Factor → Question**, with a settings popup to pick
  question types and how many of each to add. Inline editing throughout. Question types:
  multiple choice, rating scale, yes/no, open text.
- **Load Categories** — reuse categories from your previously saved assessments; selected ones are
  cloned (with fresh ids) and appended to the current builder.
- **Assessments** — list, publish/unpublish, delete, and copy a public share link.
- **Launch Pad** — lists published assessments with a **Copy link** / **Open** action.
- **Take Assessment (public)** — `/take/:id`, no login. Answer all questions, then submit with your
  name + email. Multiple submissions per email are allowed.
- **Reports** — per-assessment submissions with respondent name/email, answers rendered in the
  original hierarchy, and simple aggregate metrics (submissions, average score for gradeable types).

## Tech Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Client:** React 19, Vite, React Router 7, Tailwind CSS v4, TypeScript
- **Server:** Node, Express 5, Mongoose 9 (MongoDB), TypeScript
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`, httpOnly cookie via `cookie-parser`

## Project Structure

```
apps/
  server/            Express + Mongoose API
    src/
      models/        User, Assessment, Response (Mongoose schemas)
      routes/        auth.ts, assessments.ts (authed), public.ts (no auth)
      middleware/    auth.ts (requireAuth, signToken)
      utils/         validation.ts, assessmentValidation.ts
      types/         shared domain types
      index.ts       app bootstrap + route mounting
  client/            React + Vite SPA
    src/
      pages/         Authentication, Builder, Dashboard, LaunchPad,
                     TakeAssessment (public), Reports, NotFound
      components/     AppLayout, Sidebar, TopBar, Accordion,
                     QuestionModal, LoadCategoriesModal, ProtectedRoute
      context/       AuthContext (session hydration)
      api/           client.ts (fetch wrapper), assessments.ts, public.ts
      types/         shared domain types (mirror the server)
packages/
  typescript-config/ shared tsconfig bases
```

## Setup

### Prerequisites

- Node.js ≥ 18
- pnpm 10 (`corepack enable`)
- A MongoDB instance (local `mongod` or a MongoDB Atlas URI)

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
# Server
cp apps/server/.env.example apps/server/.env
# then edit apps/server/.env:
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/assessment-management
#   JWT_SECRET=<a long random string>

# Client (defaults are fine for local dev)
cp apps/client/.env.example apps/client/.env
```

### 3. Run (dev)

```bash
pnpm dev
```

- Client: http://localhost:3000
- Server: http://localhost:5000

The Vite dev server proxies `/api` to the backend, so cookies and CORS work out of the box.

### Other scripts

```bash
pnpm build          # build both apps
pnpm check-types    # typecheck both apps
pnpm lint           # lint both apps
```

## Architecture Overview

- **Two apps, shared types.** The client and server each keep a `types/assessment.ts` describing the
  same Category → Factor → Question and Answer/Response shapes, so the builder, taker, and reports
  all speak one language.
- **Auth.** On register/login the server signs a JWT and sets it as an httpOnly cookie. `requireAuth`
  verifies it for admin routes. The client's `AuthContext` hydrates the session via
  `GET /api/auth/me` and `ProtectedRoute` gates the admin pages.
- **Public vs. admin API.** Admin CRUD lives under `/api/assessments` (all behind `requireAuth`).
  Taking an assessment is a separate, unauthenticated router at `/api/public`:
  - `GET /api/public/assessments/:id` returns a **published** assessment (owner stripped).
  - `POST /api/public/assessments/:id/responses` accepts `{ name, email, answers }`.
- **Data model.** `Assessment` embeds its full category/factor/question tree and has a `status`
  (`draft` | `published`) and an `owner`. A `Response` stores the `assessment` id, the respondent's
  `name`/`email` (no user account), and the `answers`.
- **Validation.** Shared server-side validators check assessment structure, respondent identity
  (name + email), and per-type answer values; the client mirrors the key rules for instant feedback.

## Key Decisions

- **No login for respondents.** Taking an assessment is public by design — the share link is the
  only thing a respondent needs. Identity is captured as free-form name + email at submission, kept
  deliberately lightweight. This is enforced by a dedicated public router that never touches auth.
- **Responses are decoupled from user accounts.** The `Response` model stores `respondentName` /
  `respondentEmail` instead of a `User` ref, and there is no uniqueness constraint — **every
  submission is its own record**, so the same email can submit multiple times and each attempt shows
  up in Reports.
- **Published-only public access.** The public GET returns 404 for drafts or unknown ids, so
  unpublished work is never exposed via a guessed link.
- **Categories are copied, not linked.** "Load Categories" deep-clones the selected categories with
  fresh ids, so edits to the new assessment never mutate the source it was loaded from.
- **Simplified admin chrome.** The top bar and sidebar were trimmed to functional elements (brand,
  real signed-in user, working sign-out) to keep the UI straightforward.

## AI Usage Summary

**Tools used:** Claude Code (Anthropic) for planning, implementation, and code review.

**Sample prompts:**

- "Go through the code and implement the assessment spec. Students should be able to take the exam
  without logging in — only prompt for name and email at submission. Make the UI simpler."
- "Add a public, unauthenticated Express router for fetching a published assessment and submitting a
  response with name + email; keep the admin routes behind requireAuth."
- "Add a 'Load Categories' builder feature that lists categories from previously saved assessments
  and appends selected ones with fresh ids."

**Generated vs. manually implemented:** The initial MERN scaffold, auth, builder, dashboard, and
reports were AI-generated. This iteration — the public taker flow (`/take/:id` + name/email modal),
the `/api/public` router, decoupling `Response` from user accounts, the "Load Categories" feature,
the shareable-link actions, and the UI simplification — was implemented with Claude Code and
reviewed/verified manually (typecheck + end-to-end run of the admin build → publish → public take →
reports loop).
