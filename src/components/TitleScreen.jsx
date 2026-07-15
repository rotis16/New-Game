import { useState } from "react";
import MiniBoard from "./MiniBoard.jsx";
import { SectionLabel, ChoiceCard } from "./ui.jsx";

export default function TitleScreen({ onStart, onOpenStats, onOpenSettings, onOpenTutorial }) {
  const [selMode, setSelMode] = useState("ai");
  const [selDiff, setSelDiff] = useState("medium");

  return (
    <div style={{ maxWidth: 420, width: "100%", marginTop: "3vh", animation: "bl-rise 0.6s ease" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <MiniBoard />
      </div>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1
          className="bl-display"
          style={{
            fontWeight: 800,
            fontSize: 52,
            lineHeight: 1,
            margin: 0,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          Blocade
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "10px 0 0" }}>
          Race across the board. Wall them in. Win the line.
        </p>
      </div>

      <div style={{ marginTop: 36 }}>
        <SectionLabel>Opponent</SectionLabel>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <ChoiceCard active={selMode === "ai"} onClick={() => setSelMode("ai")} title="vs Computer" sub="Play solo" />
          <ChoiceCard active={selMode === "2p"} onClick={() => setSelMode("2p")} title="Local 2P" sub="Same device" />
        </div>
      </div>

      {selMode === "ai" && (
        <div style={{ marginTop: 22 }}>
          <SectionLabel>Difficulty</SectionLabel>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setSelDiff(d)}
                className={`bl-pill${selDiff === d ? " active" : ""}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => onStart(selMode, selDiff)} className="bl-btn-primary" style={{ width: "100%", marginTop: 34 }}>
        Start Game
      </button>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <TitleLink onClick={onOpenTutorial}>How to play</TitleLink>
        <TitleLink onClick={onOpenStats}>Stats</TitleLink>
        <TitleLink onClick={onOpenSettings}>Settings</TitleLink>
      </div>
    </div>
  );
}

function TitleLink({ children, onClick }) {
  return (
    <button onClick={onClick} className="bl-link-btn">
      {children}
    </button>
  );
}
