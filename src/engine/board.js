// Pure board/game-rule functions for Blocade. No React, no I/O — safe to
// unit test directly and to run inside a Web Worker.

export const SIZE = 9;
export const START_WALLS = 10;
export const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export const initialPositions = () => ({
  1: { row: SIZE - 1, col: 4 },
  2: { row: 0, col: 4 },
});

export const initialWalls = () => ({ h: new Set(), v: new Set() });

export function createInitialState() {
  return {
    walls: initialWalls(),
    positions: initialPositions(),
    wallsLeft: { 1: START_WALLS, 2: START_WALLS },
    toMove: 1,
  };
}

export function cloneWalls(w) {
  return { h: new Set(w.h), v: new Set(w.v) };
}

export const hKey = (r, c) => `${r}-${c}`;
export const vKey = (r, c) => `${r}-${c}`;

export const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

// Is the orthogonal step from (r1,c1) to (r2,c2) blocked by a wall?
export function isBlocked(walls, r1, c1, r2, c2) {
  if (r1 === r2) {
    const col = Math.min(c1, c2);
    if (walls.v.has(vKey(r1, col)) || walls.v.has(vKey(r1 - 1, col))) return true;
    return false;
  }
  const row = Math.min(r1, r2);
  if (walls.h.has(hKey(row, c1)) || walls.h.has(hKey(row, c1 - 1))) return true;
  return false;
}

// Candidate wall placements ({type,row,col}) that would block the single
// step from (r1,c1) to (r2,c2). Used both by isBlocked (implicitly) and by
// the AI's path-cutting wall generator.
export function wallsBlockingEdge(r1, c1, r2, c2) {
  const out = [];
  if (r1 === r2) {
    const col = Math.min(c1, c2);
    out.push({ type: "v", row: r1, col });
    out.push({ type: "v", row: r1 - 1, col });
  } else {
    const row = Math.min(r1, r2);
    out.push({ type: "h", row, col: c1 });
    out.push({ type: "h", row, col: c1 - 1 });
  }
  return out.filter((w) => w.row >= 0 && w.row < SIZE - 1 && w.col >= 0 && w.col < SIZE - 1);
}

export function getLegalMoves(walls, positions, player) {
  const me = positions[player];
  const opp = positions[player === 1 ? 2 : 1];
  const moves = [];
  for (const [dr, dc] of DIRS) {
    const nr = me.row + dr;
    const nc = me.col + dc;
    if (!inBounds(nr, nc)) continue;
    if (isBlocked(walls, me.row, me.col, nr, nc)) continue;
    if (opp.row === nr && opp.col === nc) {
      const jr = nr + dr;
      const jc = nc + dc;
      if (inBounds(jr, jc) && !isBlocked(walls, nr, nc, jr, jc)) {
        moves.push({ row: jr, col: jc });
      } else {
        const perp = dr === 0 ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
        for (const [pr, pc] of perp) {
          const dr2 = nr + pr;
          const dc2 = nc + pc;
          if (inBounds(dr2, dc2) && !isBlocked(walls, nr, nc, dr2, dc2)) {
            moves.push({ row: dr2, col: dc2 });
          }
        }
      }
    } else {
      moves.push({ row: nr, col: nc });
    }
  }
  return moves;
}

// Multi-source BFS. Returns a Map of "r-c" -> distance from the nearest
// start cell, honoring walls.
export function bfsDistances(walls, startCells) {
  const dist = new Map();
  const queue = [];
  for (const [r, c] of startCells) {
    const k = `${r}-${c}`;
    if (!dist.has(k)) {
      dist.set(k, 0);
      queue.push([r, c]);
    }
  }
  let qi = 0;
  while (qi < queue.length) {
    const [r, c] = queue[qi++];
    const d = dist.get(`${r}-${c}`);
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      if (isBlocked(walls, r, c, nr, nc)) continue;
      const k = `${nr}-${nc}`;
      if (dist.has(k)) continue;
      dist.set(k, d + 1);
      queue.push([nr, nc]);
    }
  }
  return dist;
}

export function goalRowFor(player) {
  return player === 1 ? 0 : SIZE - 1;
}

export function bfsDistance(walls, positions, player) {
  const start = positions[player];
  const goalRow = goalRowFor(player);
  const dist = bfsDistances(walls, [[start.row, start.col]]);
  let best = Infinity;
  for (let c = 0; c < SIZE; c++) {
    const d = dist.get(`${goalRow}-${c}`);
    if (d !== undefined && d < best) best = d;
  }
  return best;
}

// Shortest path (array of {row,col}, start..goal inclusive) for a player,
// or null if unreachable. Used for the optional path hint and by the AI's
// path-cutting wall generator.
export function bfsPath(walls, positions, player) {
  const start = positions[player];
  const goalRow = goalRowFor(player);
  const startKey = `${start.row}-${start.col}`;
  const visited = new Set([startKey]);
  const parent = new Map();
  const queue = [[start.row, start.col]];
  let qi = 0;
  let goalKey = null;
  if (start.row === goalRow) return [{ row: start.row, col: start.col }];
  while (qi < queue.length) {
    const [r, c] = queue[qi++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      if (isBlocked(walls, r, c, nr, nc)) continue;
      const k = `${nr}-${nc}`;
      if (visited.has(k)) continue;
      visited.add(k);
      parent.set(k, `${r}-${c}`);
      if (nr === goalRow) {
        goalKey = k;
        qi = queue.length;
        break;
      }
      queue.push([nr, nc]);
    }
  }
  if (!goalKey) return null;
  const path = [];
  let cur = goalKey;
  while (cur !== startKey) {
    const [r, c] = cur.split("-").map(Number);
    path.push({ row: r, col: c });
    cur = parent.get(cur);
  }
  path.push({ row: start.row, col: start.col });
  path.reverse();
  return path;
}

export const hasPath = (walls, positions, player) => bfsDistance(walls, positions, player) !== Infinity;

export function canPlaceWall(walls, positions, type, row, col) {
  if (row < 0 || row >= SIZE - 1 || col < 0 || col >= SIZE - 1) return false;
  if (type === "h") {
    if (walls.h.has(hKey(row, col))) return false;
    if (walls.h.has(hKey(row, col - 1))) return false;
    if (walls.h.has(hKey(row, col + 1))) return false;
    if (walls.v.has(vKey(row, col))) return false;
  } else {
    if (walls.v.has(vKey(row, col))) return false;
    if (walls.v.has(vKey(row - 1, col))) return false;
    if (walls.v.has(vKey(row + 1, col))) return false;
    if (walls.h.has(hKey(row, col))) return false;
  }
  const test = cloneWalls(walls);
  if (type === "h") test.h.add(hKey(row, col));
  else test.v.add(vKey(row, col));
  return hasPath(test, positions, 1) && hasPath(test, positions, 2);
}

export function checkWinner(positions) {
  if (positions[1].row === goalRowFor(1)) return 1;
  if (positions[2].row === goalRowFor(2)) return 2;
  return null;
}

// Apply a move/wall action to a full game state, advancing the turn.
// action = { type: 'move', to: {row,col} } | { type: 'wall', wallType, row, col }
export function applyAction(state, action) {
  const { walls, positions, wallsLeft, toMove } = state;
  const opponent = toMove === 1 ? 2 : 1;
  if (action.type === "move") {
    return {
      walls,
      positions: { ...positions, [toMove]: action.to },
      wallsLeft,
      toMove: opponent,
    };
  }
  const nextWalls = cloneWalls(walls);
  if (action.wallType === "h") nextWalls.h.add(hKey(action.row, action.col));
  else nextWalls.v.add(vKey(action.row, action.col));
  return {
    walls: nextWalls,
    positions,
    wallsLeft: { ...wallsLeft, [toMove]: wallsLeft[toMove] - 1 },
    toMove: opponent,
  };
}

export function legalWallActionsNear(walls, positions, row, col, radius) {
  const actions = [];
  const seen = new Set();
  for (let dr = -radius; dr <= radius; dr++) {
    for (let dc = -radius; dc <= radius; dc++) {
      const r = row + dr;
      const c = col + dc;
      for (const type of ["h", "v"]) {
        const k = `${type}-${r}-${c}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (canPlaceWall(walls, positions, type, r, c)) {
          actions.push({ type: "wall", wallType: type, row: r, col: c });
        }
      }
    }
  }
  return actions;
}
