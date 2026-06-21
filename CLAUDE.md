# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

智能错题本（kutato）— a smart "mistake notebook" mobile app for kids. Students record
problems they got wrong (by photo OCR or manual entry); the app organizes them, explains
them, generates similar practice problems (举一反三), quizzes the student, and schedules
spaced-repetition review.

## Tech Stack

- **Expo (React Native + TypeScript)** with **expo-router** (file-based routing)
- Local persistence: `@react-native-async-storage/async-storage`
- Camera / image picking: `expo-image-picker`
- AI: **Claude API** via `claude-opus-4-8` — handles image OCR, explanations, problem
  generation, and quizzes. Called directly from the device over `fetch`; the API key is
  stored locally on the device (see `src/ai.ts`).

## Commands

```bash
npm install        # install dependencies
npx expo start     # start the dev server (scan QR with Expo Go, or press i / w)
npx tsc --noEmit   # type-check
```

## Architecture

- `app/` — screens & navigation (expo-router). `(tabs)/` holds the 4 bottom tabs
  (错题本 / 复习 / 测验 / 设置); `problem/new.tsx` and `problem/[id].tsx` are pushed routes.
- `src/store.tsx` — `StoreProvider` + `useStore()` hook. Single source of truth for
  problems and settings, persisted to AsyncStorage. All reads/writes go through it.
- `src/ai.ts` — all Claude API calls. Uses structured outputs (`output_config.format`)
  for OCR / variants / quiz; plain text for explanations.
- `src/types.ts` — data model (`Problem`, `Settings`) and the spaced-repetition schedule
  (`REVIEW_INTERVALS_DAYS`, `computeNextReview`).
- `src/theme.ts` — colors, spacing, radius, per-subject color tags.

## Conventions

- Path alias `@/*` → `src/*` (see tsconfig).
- UI copy and comments are in Chinese (the product is Chinese-facing).
- The default model id lives in `src/types.ts` as `DEFAULT_MODEL`. When changing models,
  keep it to current Claude model ids.
- Caches AI results on the `Problem` (`explanation`, `variants`) to avoid repeat API calls.
