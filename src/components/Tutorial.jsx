import { useState } from "react";
import Board from "./Board.jsx";
import { getLegalMoves, canPlaceWall as canPlaceWallFn } from "../engine/board.js";
import { PrimaryButton, GhostButton } from "./ui.jsx";

const STEPS = [
  {
    key: "move",
    title: "Move your peg",
    body: "Tap a highlighted square to step your green peg toward the top row.",
    positions: { 1: { row: 4, col: 4 }, 2: { row: 0, col: 4 } },
    placing: false,
  },
  {
    key: "wall",
    title: "Place a wall",
    body: "Wall mode is on. Tap a groove between squares to drop a wall and slow your opponent down.",
    positions: { 1: { row: 5, col: 4 }, 2: { row: 1, col: 4 } },
    placing: true,
  },
  {
    key: "jump",
    title: "Jump the opponent",
    body: "Pegs can't share a square. When you're face-to-face, tap to hop straight over.",
    positions: { 1: { row: 4, col: 4 }, 2: { row: 3, col: 4 } },
    placing: false,
  },
  {
    key: "win",
    title: "Win the race",
    body: "First peg to reach the far row wins the round. That's the whole game — good luck!",
    positions: { 1: { row: 1, col: 4 }, 2: { row: 6, col: 4 } },
    placing: false,
    final: true,
  },
];

export default function Tutorial({ onFinish, onSkip }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [hoverWall, setHoverWall] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const step = STEPS[stepIndex];
  // Cheap enough to recreate every render — no need to memoize on stepIndex.
  const walls = { h: new Set(), v: new Set() };

  const legalMoves = step.placing ? [] : getLegalMoves(walls, step.positions, 1);

  const goNext = () => {
    setAdvanced(false);
    setHoverWall(null);
    if (stepIndex === STEPS.length - 1) onFinish();
    else setStepIndex((i) => i + 1);
  };

  const handleCellClick = (row, col) => {
    if (step.placing || advanced) return;
    if (legalMoves.some((m) => m.row === row && m.col === col)) {
      setAdvanced(true);
      setTimeout(goNext, 550);
    }
  };

  const handleWallClick = (type, row, col) => {
    if (!step.placing || advanced) return;
    if (canPlaceWallFn(walls, step.positions, type, row, col)) {
      setAdvanced(true);
      setTimeout(goNext, 550);
    }
  };

  return (
    <div style={{ maxWidth: 420, width: "100%", marginTop: "2vh", animation: "bl-rise 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              style={{
                width: 22,
                height: 4,
                borderRadius: 2,
                background: i <= stepIndex ? "var(--accent)" : "rgba(var(--ink-rgb), 0.15)",
              }}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          style={{ background: "transparent", border: "none", color: "var(--ink-faint)", fontSize: 12, fontWeight: 600, cursor: "pointer", minHeight: 32 }}
        >
          Skip
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div className="bl-display" style={{ fontWeight: 700, fontSize: 22, color: "var(--ink)" }}>
          {step.title}
        </div>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "8px auto 0", maxWidth: 320, lineHeight: 1.5 }}>{step.body}</p>
      </div>

      <Board
        walls={walls}
        positions={step.positions}
        legalMoves={legalMoves}
        turn={1}
        placing={step.placing}
        wallOrientation="h"
        winner={null}
        hoverWall={hoverWall}
        setHoverWall={setHoverWall}
        onCellClick={handleCellClick}
        onWallClick={handleWallClick}
        canPlaceWall={(t, r, c) => canPlaceWallFn(walls, step.positions, t, r, c)}
        lastAction={null}
        aiHighlight={false}
        pathHint={null}
        myTurn
        shakeId={0}
      />

      {step.final && (
        <div style={{ marginTop: 18 }}>
          <PrimaryButton onClick={goNext} style={{ width: "100%" }}>
            Let's play
          </PrimaryButton>
        </div>
      )}
      {!step.final && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <GhostButton onClick={goNext} style={{ padding: "10px 20px", minHeight: 36, fontSize: 13 }}>
            {advanced ? "Nice!" : "Skip step"}
          </GhostButton>
        </div>
      )}
    </div>
  );
}
