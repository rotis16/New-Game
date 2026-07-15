import { useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js";
import { PrimaryButton, GhostButton } from "./ui.jsx";

const CONFETTI_COUNT = 22;

function makeConfetti(seed) {
  const pieces = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    pieces.push({
      id: `${seed}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.1 + Math.random() * 0.8,
      size: 5 + Math.random() * 5,
      rotate: Math.random() * 360,
    });
  }
  return pieces;
}

// Winning pawn pulses immediately (handled by Board/Peg). This component
// layers the light sweep + confetti over the board, then reveals the stats
// card. Total time-to-card is kept under 2.5s (near-instant under reduced
// motion, per spec).
export default function WinCelebration({ winner, mode, difficulty, moveCount, wallsUsed, streak, onRematch, onMenu }) {
  const reducedMotion = usePrefersReducedMotion();
  const [showCard, setShowCard] = useState(reducedMotion);
  const confetti = useMemo(() => makeConfetti(`${winner}-${moveCount}`), [winner, moveCount]);
  const winnerColorVar = winner === 1 ? "var(--p1)" : "var(--p2)";

  useEffect(() => {
    if (reducedMotion) {
      setShowCard(true);
      return;
    }
    setShowCard(false);
    const t = setTimeout(() => setShowCard(true), 2200);
    return () => clearTimeout(t);
  }, [winner, moveCount, reducedMotion]);

  const label = winner === 1 ? "You made the line" : mode === "ai" ? `CPU got there first` : "Player 2 got there first";
  const resultLabel = mode === "ai" ? (winner === 1 ? "Win" : "Loss") : winner === 1 ? "Player 1 wins" : "Player 2 wins";

  return (
    <div style={{ position: "relative" }}>
      {!reducedMotion && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", borderRadius: 22 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "40%",
              background: "linear-gradient(90deg, transparent, rgba(var(--ink-rgb), 0.12), transparent)",
              animation: "bl-sweep 1.1s ease-out",
            }}
          />
          {confetti.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.left}%`,
                top: "-8%",
                width: p.size,
                height: p.size * 0.5,
                borderRadius: 2,
                background: winnerColorVar,
                opacity: 0.85,
                transform: `rotate(${p.rotate}deg)`,
                animation: `bl-confetti-fall ${p.duration}s ease-in ${p.delay}s both`,
              }}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <div
          className="bl-display"
          style={{
            textAlign: "center",
            fontSize: 26,
            fontWeight: 800,
            color: winnerColorVar,
            marginBottom: 14,
          }}
        >
          {label}
        </div>

        {showCard && (
          <div
            className="bl-panel"
            style={{
              animation: reducedMotion ? "bl-fade-in 0.15s ease" : "bl-card-slide 0.4s ease",
              padding: 18,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <StatCell label="Result" value={resultLabel} />
              <StatCell label="Moves" value={moveCount} />
              <StatCell label="Walls used" value={wallsUsed} />
              {mode === "ai" && <StatCell label={`Streak · ${difficulty}`} value={streak} />}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <PrimaryButton onClick={onRematch} style={{ flex: 2 }}>
                Rematch
              </PrimaryButton>
              <GhostButton onClick={onMenu} style={{ flex: 1 }}>
                Menu
              </GhostButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div className="bl-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
    </div>
  );
}
