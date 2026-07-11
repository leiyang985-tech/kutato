# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Zero-dependency, vanilla-JS interactive web pages (no build step, no external dependencies; UI text in Simplified Chinese). Two apps:

- `index.html` — 西安市动态交通网络图: a dynamic traffic map of Xi'an on Canvas 2D. Schematic road network (ring roads + arteries) as polylines in a 1000×1040 space; per-segment congestion simulated from a time-of-day peak model plus noise. Congestion uses a fixed four-step status palette (畅通/缓行/拥堵/严重拥堵).
- `math/index.html` — 初中数学·原理实验室: a first-principles interactive learning app for middle-school math. `math/index.html` contains the framework (hash router, localStorage progress store, quiz engine, canvas/slider helpers exposed as `MathLab.H`); each knowledge module lives in `math/modules/*.js` and self-registers via `MathLab.register({...})` with `hook` (curiosity intro), `sections` (concept HTML + interactive `lab` mounts), and `quiz` (mc/num questions with explanations). Mastery threshold is 80%.

Both apps share the same design tokens: theme follows `prefers-color-scheme` with a manual toggle via `data-theme` on `<html>`; canvases read colors from CSS custom properties at draw time and listen for the `mathlab-theme` event (math app) to redraw.

## Commands

There is no build or test framework. To view locally: `python3 -m http.server 8000` (or open the HTML files directly). To screenshot/verify rendering, use Playwright with the pre-installed Chromium (`executablePath: '/opt/pw-browsers/chromium'`).

## Conventions

- Keep pages dependency-free; write vanilla JS + Canvas 2D.
- New math modules: add `math/modules/<id>.js`, register with `MathLab.register`, and add a `<script src>` tag in `math/index.html`. Pedagogy order inside a module: 好奇心 hook → 原理 concept → 动手实验 lab → 闯关检测 quiz; explanations must state *why* (first principles), not just the answer.
