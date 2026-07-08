# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A zero-dependency, single-file interactive visualization: a dynamic traffic network map of Xi'an (西安市动态交通网络图).

- `index.html` — the entire app: HTML, CSS, and vanilla JS (Canvas 2D). No build step, no external dependencies; open it directly in a browser.
- The road network is schematic (ring roads + major arteries) defined as polylines in a 1000×1040 coordinate space; congestion per segment is simulated from a time-of-day peak model plus noise.
- UI text is in Simplified Chinese. Congestion levels use a fixed four-step status palette (畅通/缓行/拥堵/严重拥堵) shared across light and dark themes; theme follows `prefers-color-scheme` with a manual toggle via `data-theme` on `<html>`.

## Commands

There is no build or test framework. To view the page locally: `python3 -m http.server 8000` (or open `index.html` directly). To screenshot/verify rendering, use Playwright with the pre-installed Chromium.
