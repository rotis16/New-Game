import { START_WALLS } from "../engine/board.js";
import Peg from "./Peg.jsx";

export function SectionLabel({ children }) {
  return <div className="bl-eyebrow">{children}</div>;
}

export function ChoiceCard({ active, onClick, title, sub }) {
  return (
    <button onClick={onClick} className={`bl-choice-card${active ? " active" : ""}`}>
      <div className="bl-choice-title">{title}</div>
      <div className="bl-choice-sub">{sub}</div>
    </button>
  );
}

export function IconBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="bl-icon-btn">
      {children}
    </button>
  );
}

export function SegBtn({ children, active, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`bl-seg-btn${active ? " active" : ""}`}>
      {children}
    </button>
  );
}

export function OrientBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`bl-orient-btn${active ? " active" : ""}`}>
      {children}
    </button>
  );
}

export function PlayerPanel({ color, name, walls, active, align }) {
  const player = color === "green" ? "p1" : "p2";
  return (
    <div
      className="bl-panel"
      style={{
        flex: 1,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexDirection: align === "right" ? "row-reverse" : "row",
        borderColor: active ? `var(--${player})` : undefined,
        background: active ? "rgba(var(--ink-rgb), 0.07)" : undefined,
        transition: "all 0.2s",
      }}
    >
      <Peg color={color} size={30} active={active} />
      <div style={{ textAlign: align === "right" ? "right" : "left", flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{name}</div>
        <div
          style={{
            display: "flex",
            gap: 2,
            marginTop: 5,
            justifyContent: align === "right" ? "flex-end" : "flex-start",
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: START_WALLS }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 11,
                borderRadius: 2,
                background: i < walls ? `var(--${player})` : "rgba(var(--ink-rgb), 0.14)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="bl-btn-primary" style={style}>
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} className="bl-btn-ghost" style={style}>
      {children}
    </button>
  );
}
