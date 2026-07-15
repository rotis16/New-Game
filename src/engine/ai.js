// Blocade AI: iterative-deepening negamax with alpha-beta pruning, a
// transposition table, path-cutting wall generation, and a time budget.
// Pure functions only — this module is designed to run inside a Web Worker.

import {
  SIZE,
  bfsDistance,
  bfsDistances,
  bfsPath,
  goalRowFor,
  getLegalMoves,
  canPlaceWall,
  applyAction,
  wallsBlockingEdge,
} from "./board.js";

const WIN_SCORE = 100000;

class SearchTimeout extends Error {}

function other(player) {
  return player === 1 ? 2 : 1;
}

// Number of board cells that lie on *some* shortest path for `player`.
// A small number means the player's route is narrow/committed (vulnerable
// to being walled off); a large number means they have many alternatives.
function pathFreedomRatio(walls, positions, player) {
  const start = positions[player];
  const goalRow = goalRowFor(player);
  const goalCells = [];
  for (let c = 0; c < SIZE; c++) goalCells.push([goalRow, c]);
  const fwd = bfsDistances(walls, [[start.row, start.col]]);
  const bwd = bfsDistances(walls, goalCells);
  const total = bwd.get(`${start.row}-${start.col}`);
  if (total === undefined || total === 0) return 0;
  let freedom = 0;
  for (const [key, fd] of fwd) {
    const bd = bwd.get(key);
    if (bd !== undefined && fd + bd === total) freedom++;
  }
  return freedom / total;
}

// Static evaluation from `forPlayer`'s perspective. Higher is better for
// forPlayer. Only called at search leaves (cheap enough to include the
// path-freedom term there).
export function evaluate(state, forPlayer) {
  const { walls, positions, wallsLeft } = state;
  const opp = other(forPlayer);
  const myDist = bfsDistance(walls, positions, forPlayer);
  const oppDist = bfsDistance(walls, positions, opp);
  if (myDist === 0) return WIN_SCORE;
  if (oppDist === 0) return -WIN_SCORE;
  if (myDist === Infinity) return -WIN_SCORE;
  if (oppDist === Infinity) return WIN_SCORE;

  let score = (oppDist - myDist) * 10;
  if (wallsLeft) score += (wallsLeft[forPlayer] - wallsLeft[opp]) * 1.5;

  const myFreedom = pathFreedomRatio(walls, positions, forPlayer);
  const oppFreedom = pathFreedomRatio(walls, positions, opp);
  score += (myFreedom - oppFreedom) * 3;

  return score;
}

// Generate candidate actions for `player`: all legal moves, plus a bounded
// set of wall placements. Wall candidates come from two sources:
//   1. Near either pawn (small radius) — covers defensive/close-quarters walls.
//   2. Along the opponent's current shortest path — covers offensive walls
//      that actually threaten to lengthen their route, which matters far
//      more than raw proximity to a pawn.
export function generateActions(walls, positions, wallsLeft, player) {
  const actions = [];
  for (const m of getLegalMoves(walls, positions, player)) {
    actions.push({ type: "move", to: m });
  }
  if (wallsLeft[player] > 0) {
    const seen = new Set();
    const addIfLegal = (type, row, col) => {
      const k = `${type}-${row}-${col}`;
      if (seen.has(k)) return;
      seen.add(k);
      if (canPlaceWall(walls, positions, type, row, col)) {
        actions.push({ type: "wall", wallType: type, row, col });
      }
    };

    const radius = 1;
    for (const anchor of [positions[1], positions[2]]) {
      for (let dr = -radius; dr <= radius; dr++) {
        for (let dc = -radius; dc <= radius; dc++) {
          addIfLegal("h", anchor.row + dr, anchor.col + dc);
          addIfLegal("v", anchor.row + dr, anchor.col + dc);
        }
      }
    }

    const opponent = other(player);
    const oppPath = bfsPath(walls, positions, opponent);
    if (oppPath) {
      for (let i = 0; i < oppPath.length - 1; i++) {
        const a = oppPath[i];
        const b = oppPath[i + 1];
        for (const w of wallsBlockingEdge(a.row, a.col, b.row, b.col)) {
          addIfLegal(w.type, w.row, w.col);
        }
      }
    }
  }
  return actions;
}

function stateKey(state) {
  const { walls, positions, wallsLeft, toMove } = state;
  const hArr = Array.from(walls.h).sort().join(",");
  const vArr = Array.from(walls.v).sort().join(",");
  return `${positions[1].row}.${positions[1].col}|${positions[2].row}.${positions[2].col}|${wallsLeft[1]}.${wallsLeft[2]}|${toMove}|${hArr}|${vArr}`;
}

// Shallow static-eval move ordering so alpha-beta prunes well before the
// transposition table has anything useful to say.
function orderActions(actions, state, ttMove) {
  const mover = state.toMove;
  const scored = actions.map((a) => {
    if (ttMove && actionsEqual(a, ttMove)) return { a, h: Infinity };
    const ns = applyAction(state, a);
    return { a, h: evaluate(ns, mover) };
  });
  scored.sort((x, y) => y.h - x.h);
  return scored.map((s) => s.a);
}

function actionsEqual(a, b) {
  if (!a || !b || a.type !== b.type) return false;
  if (a.type === "move") return a.to.row === b.to.row && a.to.col === b.to.col;
  return a.wallType === b.wallType && a.row === b.row && a.col === b.col;
}

function negamax(state, depth, alpha, beta, ply, deadline, tt, counter) {
  counter.nodes++;
  if ((counter.nodes & 511) === 0 && performance.now() > deadline) {
    throw new SearchTimeout();
  }

  const { positions, toMove } = state;
  const mover = toMove;
  const opp = other(mover);
  const moverDist = bfsDistance(state.walls, positions, mover);
  const oppDist = bfsDistance(state.walls, positions, opp);

  if (moverDist === 0) return WIN_SCORE - ply;
  if (oppDist === 0) return -WIN_SCORE + ply;

  if (depth === 0) {
    return evaluate(state, mover);
  }

  const key = stateKey(state);
  let ttMove = null;
  const ttEntry = tt.get(key);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === "EXACT") return ttEntry.value;
    if (ttEntry.flag === "LOWER") alpha = Math.max(alpha, ttEntry.value);
    else if (ttEntry.flag === "UPPER") beta = Math.min(beta, ttEntry.value);
    if (alpha >= beta) return ttEntry.value;
  }
  if (ttEntry) ttMove = ttEntry.bestAction;

  const actions = orderActions(
    generateActions(state.walls, positions, state.wallsLeft, mover),
    state,
    ttMove
  );

  let best = -Infinity;
  let bestAction = null;
  const origAlpha = alpha;
  for (const action of actions) {
    const ns = applyAction(state, action);
    const val = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, deadline, tt, counter);
    if (val > best) {
      best = val;
      bestAction = action;
    }
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  let flag = "EXACT";
  if (best <= origAlpha) flag = "UPPER";
  else if (best >= beta) flag = "LOWER";
  tt.set(key, { depth, value: best, flag, bestAction });

  return best;
}

// Iterative-deepening search with a wall-clock time budget. Returns the
// best action found at the deepest fully-completed depth.
export function searchBestAction(state, { timeBudgetMs, maxDepth = 12 } = {}) {
  const deadline = performance.now() + timeBudgetMs;
  const tt = new Map();
  const counter = { nodes: 0 };

  let bestAction = null;
  let depthReached = 0;
  const rootActions = generateActions(state.walls, state.positions, state.wallsLeft, state.toMove);
  if (rootActions.length === 0) return { action: null, depth: 0, nodes: 0 };
  if (rootActions.length === 1) return { action: rootActions[0], depth: 1, nodes: 0 };

  let orderedRoot = rootActions;

  for (let depth = 1; depth <= maxDepth; depth++) {
    let currentBest = null;
    let currentBestVal = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    try {
      const scored = [];
      for (const action of orderedRoot) {
        const ns = applyAction(state, action);
        const val = -negamax(ns, depth - 1, -beta, -alpha, 1, deadline, tt, counter);
        scored.push({ action, val });
        if (val > currentBestVal) {
          currentBestVal = val;
          currentBest = action;
        }
        if (currentBestVal > alpha) alpha = currentBestVal;
      }
      scored.sort((a, b) => b.val - a.val);
      orderedRoot = scored.map((s) => s.action);
      bestAction = currentBest;
      depthReached = depth;
      // A forced win/loss has been found at the root; no need to search deeper.
      if (Math.abs(currentBestVal) >= WIN_SCORE - SIZE * SIZE) break;
    } catch (e) {
      if (e instanceof SearchTimeout) break;
      throw e;
    }
    if (performance.now() > deadline) break;
  }

  return { action: bestAction, depth: depthReached, nodes: counter.nodes };
}

// ---- Difficulty-tuned move selection -------------------------------------

const TIME_BUDGET_MS = { easy: 50, medium: 400, hard: 1500 };

function easyMove(walls, positions, wallsLeft, player) {
  const opponent = other(player);
  const moves = getLegalMoves(walls, positions, player);
  const scored = moves.map((m) => {
    const np = { ...positions, [player]: m };
    return { type: "move", to: m, score: -bfsDistance(walls, np, player) };
  });
  if (wallsLeft[player] > 0 && Math.random() < 0.35) {
    const op = positions[opponent];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        for (const type of ["h", "v"]) {
          const r = op.row + dr;
          const c = op.col + dc;
          if (canPlaceWall(walls, positions, type, r, c)) {
            scored.push({ type: "wall", wallType: type, row: r, col: c, score: -bfsDistance(walls, positions, player) });
          }
        }
      }
    }
  }
  scored.sort((a, b) => b.score - a.score);
  // Noisy, but never actively backward: only moves within 1 step of the
  // best score are eligible, so "easy" wastes tempo sideways/on bad walls
  // without ever wandering away from the goal indefinitely.
  const bestScore = scored[0]?.score ?? -Infinity;
  const pool = scored.filter((s) => s.score >= bestScore - 1);
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

// state = { walls, positions, wallsLeft }; player is whichever side should move.
export function aiChooseMove(walls, positions, wallsLeft, player, difficulty, opts = {}) {
  if (difficulty === "easy") {
    return easyMove(walls, positions, wallsLeft, player);
  }
  const timeBudgetMs = opts.timeBudgetMs ?? TIME_BUDGET_MS[difficulty] ?? TIME_BUDGET_MS.medium;
  const state = { walls, positions, wallsLeft, toMove: player };
  const { action } = searchBestAction(state, { timeBudgetMs, maxDepth: opts.maxDepth ?? 12 });
  return action;
}

export { TIME_BUDGET_MS };
