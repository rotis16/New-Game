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
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 900,
            fontSize: 60,
            lineHeight: 1,
            margin: "0",
            letterSpacing: "-0.02em",
            background: "linear-gradient(180deg, #f6ead6 0%, #d8b88a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 20px rgba(216,184,138,0.15)",
          }}
        >
          Blocade
        </h1>
        <p style={{ color: "#a89072", fontSize: 14, margin: "10px 0 0" }}>
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
                style={{
                  flex: 1,
                  padding: "10px 0",
                  minHeight: 44,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: 13,
                  textTransform: "capitalize",
                  transition: "all 0.15s",
                  background: selDiff === d ? "#ece0cd" : "rgba(236,224,205,0.06)",
                  color: selDiff === d ? "#20160f" : "#a89072",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => onStart(selMode, selDiff)}
        style={{
          width: "100%",
          marginTop: 34,
          padding: "18px 0",
          minHeight: 44,
          borderRadius: 14,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Fraunces', serif",
          fontWeight: 600,
          fontSize: 20,
          color: "#20160f",
          background: "linear-gradient(180deg, #e8c88f 0%, #d0a86a 100%)",
          boxShadow: "0 8px 24px rgba(208,168,106,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
          transition: "transform 0.1s",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
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
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px 0",
        minHeight: 44,
        borderRadius: 10,
        border: "1px solid rgba(236,224,205,0.1)",
        background: "rgba(236,224,205,0.03)",
        color: "#c4b299",
        fontFamily: "inherit",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
