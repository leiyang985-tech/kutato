# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

数学思维实验室 (Math Thinking Lab) — an interactive math learning site for an 8th grader, built on a "hands-on first, then understand" (first-principles) philosophy. See README.md for the module overview.

## Architecture

- The entire app is a single file: `index.html` (markup + CSS + vanilla JS, no build system, no dependencies, no network requests). It must stay self-contained and openable via `file://`.
- Hash-based routing between pages (`#home`, `#func`, `#formula`, `#tri`, `#guide`); each page is a `<section class="page">` toggled by `route()`.
- Design tokens are CSS custom properties on `:root`, with dark-theme overrides via both `@media (prefers-color-scheme: dark)` and `[data-theme]` attributes. Style components through tokens only.
- SVG scenes are built imperatively via the `mk()` helper. Interactive geometry (triangle lab) uses Pointer Events with `setPointerCapture`.
- Progress persists in localStorage under key `mathlab` (guard all access with try/catch).
- UI copy is Simplified Chinese; math expressions use class `.math` (serif italic, textbook style).

## Testing

No test framework. Verify changes by opening `index.html` in a browser, or headlessly with playwright-core using the preinstalled Chromium at `/opt/pw-browsers/chromium` (check for console/page errors and exercise the interactions).
