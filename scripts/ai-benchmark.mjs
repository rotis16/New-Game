#!/usr/bin/env node
// AI strength benchmark: pits the real search (aiChooseMove) against two
// scripted opponents of increasing strength, at each difficulty tier.
// Acceptance (per spec):
//   hard   beats greedy racer     100%
//   hard   beats reactive waller  >= 90%
//   medium beats reactive waller  >= 60%
//   easy   loses to reactive waller most of the time (< 50% win rate)

import {
  createInitialState,
  applyAction,
  bfsDistance,
  bfsPath,
  canPlaceWall,
  checkWinner,
  getLegalMoves,
  wallsBlockingEdge,
  cloneWalls,
} from "../src/engine/board.js";
import { aiChooseMove } from "../src/engine/ai.js";

const MAX_PLIES = 220;

function other(p) {
  return p === 1 ? 2 : 1;
}

// ---- Scripted opponents ----------------------------------------------

function greedyRacerMove(state, player) {
  const { walls, positions } = state;
  const moves = getLegalMoves(walls, positions, player);
  let best = moves[0];
  let bestDist = Infinity;
  for (const m of moves) {
    const np = { ...positions, [player]: m };
    const d = bfsDistance(walls, np, player);
    if (d < bestDist) {
      bestDist = d;
      best = m;
    }
  }
  return { type: "move", to: best };
}

// Moves greedily, but reactively drops a wall in the opponent's way when
// the opponent is close to (or ahead in the race to) their goal.
function reactiveWallerMove(state, player) {
  const { walls, positions, wallsLeft } = state;
  const opp = other(player);
  const myDist = bfsDistance(walls, positions, player);
  const oppDist = bfsDistance(walls, positions, opp);

  if (wallsLeft[player] > 0 && oppDist <= Math.max(myDist + 2, 4)) {
    const candidates = new Map();
    const addCandidate = (type, row, col) => {
      candidates.set(`${type}-${row}-${col}`, { type: "wall", wallType: type, row, col });
    };
    const oppPos = positions[opp];
    const radius = 2;
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        addCandidate("h", oppPos.row + dr, oppPos.col + dc);
        addCandidate("v", oppPos.row + dr, oppPos.col + dc);
      }
    }
    const oppPath = bfsPath(walls, positions, opp);
    if (oppPath) {
      for (let i = 0; i < oppPath.length - 1; i++) {
        for (const w of wallsBlockingEdge(oppPath[i].row, oppPath[i].col, oppPath[i + 1].row, oppPath[i + 1].col)) {
          addCandidate(w.type, w.row, w.col);
        }
      }
    }
    let bestGain = 0;
    let bestWall = null;
    for (const c of candidates.values()) {
      if (!canPlaceWall(walls, positions, c.wallType, c.row, c.col)) continue;
      const testWalls = cloneWalls(walls);
      if (c.wallType === "h") testWalls.h.add(`${c.row}-${c.col}`);
      else testWalls.v.add(`${c.row}-${c.col}`);
      const newOppDist = bfsDistance(testWalls, positions, opp);
      const gain = newOppDist - oppDist;
      if (gain > bestGain) {
        bestGain = gain;
        bestWall = c;
      }
    }
    if (bestWall && bestGain >= 1) return bestWall;
  }
  return greedyRacerMove(state, player);
}

// ---- Game runner --------------------------------------------------------

function playGame(p1Move, p2Move) {
  let state = createInitialState();
  let plies = 0;
  while (plies < MAX_PLIES) {
    const winner = checkWinner(state.positions);
    if (winner) return { winner, plies };
    const mover = state.toMove;
    const chooser = mover === 1 ? p1Move : p2Move;
    const action = chooser(state, mover);
    if (!action) break;
    state = applyAction(state, action);
    plies++;
  }
  return { winner: checkWinner(state.positions), plies, timedOut: true };
}

function aiMover(difficulty) {
  return (state, player) => aiChooseMove(state.walls, state.positions, state.wallsLeft, player, difficulty);
}

function runMatch(label, aiDifficulty, opponentMove, games) {
  let aiWins = 0;
  let oppWins = 0;
  let draws = 0;
  const started = Date.now();
  for (let i = 0; i < games; i++) {
    const aiIsP1 = i % 2 === 0;
    const p1Move = aiIsP1 ? aiMover(aiDifficulty) : opponentMove;
    const p2Move = aiIsP1 ? opponentMove : aiMover(aiDifficulty);
    const result = playGame(p1Move, p2Move);
    const aiPlayer = aiIsP1 ? 1 : 2;
    if (result.winner === aiPlayer) aiWins++;
    else if (result.winner) oppWins++;
    else draws++;
  }
  const winRate = aiWins / games;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `${label}: AI ${aiWins}/${games} (${(winRate * 100).toFixed(0)}%)  opp ${oppWins}  draws ${draws}  [${secs}s]`
  );
  return winRate;
}

// ---- Run + check acceptance ----------------------------------------------

function parseArg(name, def) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? Number(arg.split("=")[1]) : def;
}

const hardGames = parseArg("hardGames", 10);
const mediumGames = parseArg("mediumGames", 16);
const easyGames = parseArg("easyGames", 16);

console.log("Blocade AI benchmark\n---------------------");

const hardVsGreedy = runMatch("hard   vs greedy racer  ", "hard", greedyRacerMove, hardGames);
const hardVsWaller = runMatch("hard   vs reactive waller", "hard", reactiveWallerMove, hardGames);
const mediumVsWaller = runMatch("medium vs reactive waller", "medium", reactiveWallerMove, mediumGames);
const easyVsWaller = runMatch("easy   vs reactive waller", "easy", reactiveWallerMove, easyGames);

console.log("\nAcceptance criteria");
console.log("--------------------");
const checks = [
  ["hard beats greedy racer 100%", hardVsGreedy >= 1.0],
  ["hard beats reactive waller >= 90%", hardVsWaller >= 0.9],
  ["medium beats reactive waller >= 60%", mediumVsWaller >= 0.6],
  ["easy loses to reactive waller most of the time (< 50%)", easyVsWaller < 0.5],
];
let allPass = true;
for (const [desc, pass] of checks) {
  console.log(`${pass ? "PASS" : "FAIL"}  ${desc}`);
  if (!pass) allPass = false;
}

if (!allPass) process.exit(1);
