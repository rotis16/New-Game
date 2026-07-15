import { useReducer, useCallback } from "react";
import { createInitialState, applyAction, checkWinner } from "../engine/board.js";

function snapshotOf(state) {
  return { walls: state.walls, positions: state.positions, wallsLeft: state.wallsLeft, toMove: state.toMove };
}

function initGame(mode, difficulty) {
  return {
    mode,
    difficulty,
    ...createInitialState(),
    winner: null,
    lastAction: null,
    actionId: 0,
    moveCount: 0,
    history: [],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return initGame(action.mode, action.difficulty);
    case "APPLY": {
      if (state.winner) return state;
      const snapshot = snapshotOf(state);
      const next = applyAction(snapshot, action.action);
      const winner = checkWinner(next.positions);
      return {
        ...state,
        ...next,
        winner,
        lastAction: { ...action.action, player: snapshot.toMove },
        actionId: state.actionId + 1,
        moveCount: state.moveCount + 1,
        history: [...state.history, snapshot],
      };
    }
    case "UNDO_ROUND": {
      const steps = action.steps ?? 1;
      if (state.history.length < steps) return state;
      const target = state.history[state.history.length - steps];
      return {
        ...state,
        ...target,
        winner: null,
        lastAction: null,
        actionId: state.actionId + 1,
        moveCount: Math.max(0, state.moveCount - steps),
        history: state.history.slice(0, state.history.length - steps),
      };
    }
    default:
      return state;
  }
}

export function useGame(initialMode = "ai", initialDifficulty = "medium") {
  const [state, dispatch] = useReducer(reducer, undefined, () => initGame(initialMode, initialDifficulty));

  const start = useCallback((mode, difficulty) => dispatch({ type: "START", mode, difficulty }), []);
  const apply = useCallback((action) => dispatch({ type: "APPLY", action }), []);
  const undoRound = useCallback((steps) => dispatch({ type: "UNDO_ROUND", steps }), []);

  return { state, start, apply, undoRound };
}
