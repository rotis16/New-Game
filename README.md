# Blocade

A mobile-first wall-blocking strategy race game (Quoridor-style), built with
Vite + React.

## Rules

9x9 board. Player 1 (green) starts bottom-center and races to any square in
the top row; Player 2 (red) starts top-center and races to the bottom row.
Each turn: move one square orthogonally, or place one of your 10 walls. A
wall may never completely seal off either player's path to their goal.
Adjacent pawns can be jumped straight, or diagonally if the straight jump is
blocked. First to the far row wins.

## Project structure

- `src/engine/` — pure game logic (no React), unit tested and safe to run in
  a Web Worker:
  - `board.js` — moves, jumps, wall legality, BFS pathing, win detection.
  - `ai.js` — iterative-deepening negamax with alpha-beta pruning, a
    transposition table, and path-cutting wall generation.
  - `ai.worker.js` — runs the AI search off the main thread.
- `src/components/` — UI (title, board, game screen, tutorial, stats,
  settings, win celebration).
- `src/hooks/` — `useGame` (reducer-based game state + undo history),
  `useAiWorker`, `useLocalStorage`, `usePrefersReducedMotion`.
- `src/sound/audio.js` — synthesized WebAudio sound effects (no audio files).
- `scripts/ai-benchmark.mjs` — node harness pitting the AI against scripted
  opponents to validate difficulty strength (`npm run bench`).

## Scripts

```
npm run dev       # start the dev server
npm run build     # production build
npm test          # run engine/AI unit tests (vitest)
npm run bench     # AI strength benchmark vs scripted opponents
npm run lint      # oxlint
```

## AI strength

`npm run bench` plays the real search against two scripted opponents (a
greedy racer, and a reactive waller that reacts to threats) at each
difficulty. Acceptance targets: hard beats the greedy racer 100% and the
reactive waller ≥90%; medium beats the reactive waller ≥60%; easy loses to
it most of the time. Current results (10-16 games per matchup): hard 100% /
100%, medium 100%, easy 0%.
