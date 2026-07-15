import { START_WALLS } from "../engine/board.js";
import Peg from "./Peg.jsx";

export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a7458" }}>
      {children}
    </div>
  );
}

export function ChoiceCard({ active, onClick, title, sub }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "16px 14px",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "all 0.15s",
        minHeight: 44,
        border: active ? "1.5px solid #d0a86a" : "1.5px solid rgba(236,224,205,0.08)",
        background: active ? "rgba(208,168,106,0.12)" : "rgba(236,224,205,0.03)",
      }}
    >
      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: active ? "#f4e8d4" : "#c4b299" }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "#8a7458", marginTop: 2 }}>{sub}</div>
    </button>
  );
}

export function IconBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: "none",
        color: disabled ? "#5c4c39" : "#a89072",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "10px 10px",
        borderRadius: 8,
        minHeight: 44,
      }}
    >
      {children}
    </button>
  );
}

export function SegBtn({ children, active, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: "13px 0",
        borderRadius: 10,
        border: "none",
        minHeight: 44,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: 15,
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.15s",
        background: active ? "linear-gradient(180deg, #ece0cd 0%, #dccbaf 100%)" : "transparent",
        color: active ? "#20160f" : "#c4b299",
        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export function OrientBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "11px 0",
        borderRadius: 10,
        minHeight: 44,
        border: active ? "1.5px solid #d0a86a" : "1.5px solid rgba(236,224,205,0.1)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        transition: "all 0.15s",
        background: active ? "rgba(208,168,106,0.14)" : "transparent",
        color: active ? "#f4e8d4" : "#a89072",
      }}
    >
      {children}
    </button>
  );
}

export function PlayerPanel({ color, name, walls, active, align }) {
  const accent = color === "green" ? "#4a7c3f" : "#a8483a";
  return (
    <div
      style={{
        flex: 1,
        padding: "12px 14px",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexDirection: align === "right" ? "row-reverse" : "row",
        background: active ? "rgba(236,224,205,0.08)" : "rgba(236,224,205,0.03)",
        border: active ? `1.5px solid ${accent}` : "1.5px solid transparent",
        transition: "all 0.2s",
      }}
    >
      <Peg color={color} size={30} active={active} />
      <div style={{ textAlign: align === "right" ? "right" : "left", flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8d5b5" }}>{name}</div>
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
            <div key={i} style={{ width: 3, height: 11, borderRadius: 2, background: i < walls ? accent : "rgba(236,224,205,0.12)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "16px 0",
        borderRadius: 14,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize: 18,
        color: "#20160f",
        minHeight: 44,
        opacity: disabled ? 0.5 : 1,
        background: "linear-gradient(180deg, #e8c88f 0%, #d0a86a 100%)",
        boxShadow: "0 8px 20px rgba(208,168,106,0.25)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "16px 0",
        borderRadius: 14,
        border: "1px solid rgba(236,224,205,0.15)",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 600,
        fontSize: 15,
        color: "#c4b299",
        background: "transparent",
        minHeight: 44,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
