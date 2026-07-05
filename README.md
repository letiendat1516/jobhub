# JobHub

**JobHub** is an AI-powered recruitment platform that connects job seekers with
employers through intelligent resume analysis and job recommendation.

This repository contains the project **scaffold** (project structure + configuration)
and the **Homepage** only. Business logic, CRUD, APIs, database, AI and
authentication are implemented in later phases per `docs/07_AI_AGENT_RULES.md`.

> 📄 The `docs/` directory is the single source of truth. Read it before
> touching any code.

---

## Architecture

MVC + Layered Architecture (see `docs/02_ARCHITECTURE.md`):

```
Presentation (React) → Controller → Service → Repository → Supabase (PostgreSQL)
```

- Each layer has a single responsibility and depends only on the layer below it.
- The AI (DeepSeek) is an external analysis service; business logic always lives
  in the Service layer.

---

## Repository layout

```
jobhub/
├── docs/                 # Single source of truth (project documentation)
├── backend/              # Node.js + Express API (MVC + layered)
│   └── src/{config,controllers,services,repositories,routes,middlewares,validators,utils}
└── frontend/             # React + Vite + TailwindCSS
    └── src/{assets,components,layouts,pages,routes,services,hooks,utils,data}
```

---

## Getting started

### Prerequisites

- Node.js ≥ 20

### Backend

```bash
cd backend
cp .env.example .env      # then edit values
npm install
npm run dev               # http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env      # optional for dev (defaults to /api proxy)
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000`.

---

## Implemented phases

| Phase | Status |
| ----- | ------ |
| 1 — Project Structure | ✅ |
| 2 — Homepage | ✅ |
| 3 — Authentication | ⏳ |
| 4+ — See `docs/07_AI_AGENT_RULES.md §22` | ⏳ |
"# jobhub" 
"# jobhub" 
