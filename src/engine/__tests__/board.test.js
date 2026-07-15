import { describe, it, expect } from "vitest";
import {
  SIZE,
  createInitialState,
  getLegalMoves,
  bfsDistance,
  bfsPath,
  canPlaceWall,
  checkWinner,
  applyAction,
  isBlocked,
  cloneWalls,
  hasPath,
} from "../board.js";

describe("getLegalMoves", () => {
  it("allows the four orthogonal moves from the open center", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 0, col: 0 } };
    const moves = getLegalMoves(walls, positions, 1);
    expect(moves).toHaveLength(4);
  });

  it("blocks a move when a wall sits on that edge", () => {
    const walls = { h: new Set(["3-4"]), v: new Set() };
    // wall at h(3,4) blocks the vertical step between row 3 and row 4 at columns 4 and 5
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 0, col: 0 } };
    const moves = getLegalMoves(walls, positions, 1);
    expect(moves.some((m) => m.row === 3 && m.col === 4)).toBe(false);
  });

  it("jumps straight over an adjacent opponent", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 3, col: 4 } };
    const moves = getLegalMoves(walls, positions, 1);
    expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(true);
  });

  it("jumps diagonally when the straight jump is walled off", () => {
    // Player at (4,4), opponent at (3,4). A wall blocks the landing square (2,4).
    const walls = { h: new Set(["2-3"]), v: new Set() };
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 3, col: 4 } };
    const moves = getLegalMoves(walls, positions, 1);
    expect(moves.some((m) => m.row === 2 && m.col === 4)).toBe(false);
    expect(moves.some((m) => m.row === 3 && m.col === 3)).toBe(true);
    expect(moves.some((m) => m.row === 3 && m.col === 5)).toBe(true);
  });

  it("does not allow diagonal jump if that side is also walled", () => {
    const walls = { h: new Set(["2-3"]), v: new Set(["3-3"]) };
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 3, col: 4 } };
    const moves = getLegalMoves(walls, positions, 1);
    expect(moves.some((m) => m.row === 3 && m.col === 3)).toBe(false);
    expect(moves.some((m) => m.row === 3 && m.col === 5)).toBe(true);
  });
});

describe("wall placement legality", () => {
  it("rejects overlapping walls of the same orientation", () => {
    const walls = { h: new Set(["3-3"]), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(canPlaceWall(walls, positions, "h", 3, 3)).toBe(false);
  });

  it("rejects a horizontal wall that overlaps a neighboring horizontal wall", () => {
    const walls = { h: new Set(["3-3"]), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(canPlaceWall(walls, positions, "h", 3, 4)).toBe(false);
    expect(canPlaceWall(walls, positions, "h", 3, 2)).toBe(false);
  });

  it("rejects a wall that crosses a perpendicular wall at the same slot", () => {
    const walls = { h: new Set(["3-3"]), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(canPlaceWall(walls, positions, "v", 3, 3)).toBe(false);
  });

  it("rejects a wall placement outside the board", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(canPlaceWall(walls, positions, "h", -1, 0)).toBe(false);
    expect(canPlaceWall(walls, positions, "h", SIZE - 1, 0)).toBe(false);
  });

  it("rejects a wall that would completely seal a player's path to the goal", () => {
    // Pocket player 2 (goal = row 8) against the top-right corner of the
    // board: h(0,5) + v(0,4) already block columns 5-6 downward and the
    // 4|5 column boundary, leaving columns 7-8 as the only escape from row
    // 0. Closing that last gap with h(0,7) would fully seal player 2 in
    // row 0 forever, so it must be rejected.
    const walls = { h: new Set(["0-5"]), v: new Set(["0-4"]) };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 6 } };
    expect(hasPath(walls, positions, 2)).toBe(true);
    expect(canPlaceWall(walls, positions, "h", 0, 7)).toBe(false);
  });

  it("allows a wall that merely lengthens a path, not seals it", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(canPlaceWall(walls, positions, "h", 3, 3)).toBe(true);
  });
});

describe("bfsDistance / bfsPath", () => {
  it("finds the direct distance on an open board", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    expect(bfsDistance(walls, positions, 1)).toBe(8);
    expect(bfsDistance(walls, positions, 2)).toBe(8);
  });

  it("returns a walkable path whose length matches bfsDistance", () => {
    const walls = { h: new Set(), v: new Set() };
    const positions = { 1: { row: 8, col: 4 }, 2: { row: 0, col: 4 } };
    const path = bfsPath(walls, positions, 1);
    expect(path).not.toBeNull();
    expect(path.length - 1).toBe(bfsDistance(walls, positions, 1));
    expect(path[0]).toEqual({ row: 8, col: 4 });
    expect(path[path.length - 1].row).toBe(0);
  });
});

describe("checkWinner", () => {
  it("declares player 1 the winner on reaching row 0", () => {
    const positions = { 1: { row: 0, col: 3 }, 2: { row: 5, col: 5 } };
    expect(checkWinner(positions)).toBe(1);
  });

  it("declares player 2 the winner on reaching the bottom row", () => {
    const positions = { 1: { row: 4, col: 3 }, 2: { row: SIZE - 1, col: 5 } };
    expect(checkWinner(positions)).toBe(2);
  });

  it("returns null mid-game", () => {
    const positions = { 1: { row: 4, col: 4 }, 2: { row: 5, col: 5 } };
    expect(checkWinner(positions)).toBeNull();
  });
});

describe("applyAction", () => {
  it("moves the pawn and advances the turn", () => {
    const state = createInitialState();
    const next = applyAction(state, { type: "move", to: { row: 7, col: 4 } });
    expect(next.positions[1]).toEqual({ row: 7, col: 4 });
    expect(next.toMove).toBe(2);
    expect(next.wallsLeft[1]).toBe(state.wallsLeft[1]);
  });

  it("places a wall, decrements walls left, and advances the turn", () => {
    const state = createInitialState();
    const next = applyAction(state, { type: "wall", wallType: "h", row: 3, col: 3 });
    expect(next.walls.h.has("3-3")).toBe(true);
    expect(next.wallsLeft[1]).toBe(state.wallsLeft[1] - 1);
    expect(next.toMove).toBe(2);
    // original state must be untouched (pure function)
    expect(state.walls.h.has("3-3")).toBe(false);
  });
});

describe("isBlocked / cloneWalls", () => {
  it("cloneWalls produces an independent copy", () => {
    const walls = { h: new Set(["1-1"]), v: new Set() };
    const clone = cloneWalls(walls);
    clone.h.add("2-2");
    expect(walls.h.has("2-2")).toBe(false);
  });

  it("isBlocked is false with no walls present", () => {
    const walls = { h: new Set(), v: new Set() };
    expect(isBlocked(walls, 4, 4, 3, 4)).toBe(false);
  });
});
