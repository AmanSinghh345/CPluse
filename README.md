# CPulse

**CPulse** is a Codeforces analytics and practice-planning platform that converts a user's public contest and submission history into actionable insights.

Instead of only showing rating and solved-problem counts, CPulse analyzes mistakes, topic performance, contest trends, consistency, and problem difficulty to help users decide what they should practice next.

## Live Demo

[Open CPulse](https://c-pluse.vercel.app/)

## Features

- Analyze any public Codeforces profile using its handle
- Track rating movement and contest performance
- View topic-wise strengths and weaknesses
- Analyze submission history and wrong-answer patterns
- Generate a focused practice range based on current performance
- Find attempted problems for structured upsolving
- Maintain a lightweight practice sheet
- Track active days and solving streaks
- View upcoming Codeforces contests
- Compare the performance of two Codeforces users
- Visualize statistics using charts and activity calendars
- No login or account setup required

## How It Works

1. Enter a valid Codeforces handle.
2. CPulse fetches publicly available Codeforces data.
3. The application analyzes contests, submissions, ratings, tags, and problem difficulty.
4. The dashboard presents useful insights and practice recommendations.

## Main Pages

- **Home** — Search for a Codeforces handle
- **Dashboard** — View profile statistics and performance analysis
- **Upsolve** — Find previously attempted problems worth revisiting
- **Compare** — Compare two Codeforces handles
- **Contests** — View upcoming Codeforces contests
- **Sheet** — Organize problems for focused practice

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

### Validation and Utilities

- Zod
- date-fns
- clsx
- tailwind-merge

### Data Source

- Codeforces Public API

### Deployment

- Vercel

## Project Structure

```text
src/
├── app/
│   ├── api/
│   ├── compare/
│   ├── contests/
│   ├── dashboard/[handle]/
│   ├── sheet/
│   ├── upsolve/[handle]/
│   └── page.tsx
├── components/
│   ├── activity-calendar.tsx
│   ├── animated-pointer.tsx
│   ├── charts.tsx
│   ├── handle-search.tsx
│   ├── header.tsx
│   └── ui.tsx
├── data/
├── lib/
│   ├── analysis.ts
│   ├── codeforces.ts
│   ├── sheet-data.ts
│   └── utils.ts
└── types/

Getting Started
Prerequisites

Install the following:

Node.js 20 or later
npm
Installation

Clone the repository:

git clone https://github.com/AmanSinghh345/CPluse.git
cd CPluse

Install dependencies:

npm install

Start the development server:

npm run dev

Open the application at:

http://localhost:3000
Available Scripts
npm run dev

Runs the application in development mode.

npm run build

Creates a production build.

npm run start

Runs the production build.

npm run lint

Checks the project using ESLint.

npm run typecheck
