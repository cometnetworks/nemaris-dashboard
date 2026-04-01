# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nemaris Dashboard is a SAP prospect discovery platform for the Mexican market. Users upload PDF reports, AI extracts structured prospect data (in Spanish), and the app provides a CRM-like interface to manage prospects, meetings, and pipeline.

## Commands

```bash
npm run dev          # Start Vite dev server (frontend only)
npx convex dev       # Start Convex backend (run alongside dev server)
npm run build        # Production build to /dist
npm run lint         # ESLint
npm run test         # Vitest (single run)
npx vitest           # Vitest in watch mode
```

Both `npm run dev` and `npx convex dev` must run simultaneously for local development.

## Architecture

**Stack:** React 19 + Vite 8 + Tailwind CSS 4 (frontend), Convex (real-time backend/database), multi-provider AI extraction (Groq → OpenRouter → Together AI fallback chain).

### Routing & State

- **No React Router.** Tab-based navigation managed via `activeTab` state in `App.jsx`.
- **No Redux/Zustand.** Convex is the single source of truth. Components get reactive data via `useQuery`/`useMutation` hooks wrapped in custom hooks (`useProspects`, `useMeetings`, `useTheme`).
- The `ConvexProvider` in `main.jsx` handles real-time sync via WebSocket — no polling needed.

### Data Flow

1. `src/hooks/useProspects.js` and `src/hooks/useMeetings.js` wrap Convex API calls and map `_id` → `id` for React consumption.
2. `App.jsx` orchestrates all hooks and passes data/callbacks as props to page components.
3. Pages are in `src/pages/`, layout components in `src/components/Layout/`.

### Backend (Convex)

- `convex/schema.js` — Database schema (prospects, meetings, reportHistory tables).
- `convex/prospects.js` — CRUD + smart deduplication. Company names are normalized (strips "S.A.", "S.C.", etc.) and duplicates merge by keeping the richest data (most filled fields, highest score, union of arrays).
- `convex/meetings.js` — CRUD + Convex Storage for PDF brief attachments.
- `convex/reports.js` — Report history tracking.
- `convex/_generated/` — Auto-generated, do not edit.

### AI Extraction Pipeline

`src/utils/aiParser.js` sends PDF text to LLM APIs with a Spanish-language prompt to extract structured prospect data. Key constraints:
- Input capped at 12,000 chars to avoid context length errors.
- Fallback chain: Groq → OpenRouter → Together AI.
- Retry with exponential backoff on 429 errors.
- API keys are in `.env` prefixed with `VITE_` (exposed to client — no server-side secrets).

### Dark Mode

`useTheme` hook toggles the `dark` class on `<html>` and persists to localStorage. All components receive `isDark` prop and use conditional Tailwind classes.

## Conventions

- UI text and AI prompts are in **Spanish**.
- Prospect IDs are generated as `company-slug-DDMMYY` strings, not UUIDs.
- The app targets the Convex deployment at `dapper-lion-760.convex.cloud`.
- Frontend deploys to Cloudflare Pages via git push.
