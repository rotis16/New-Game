import { useState } from "react";
import { IconBtn } from "./ui.jsx";

export default function SettingsScreen({ settings, onChange, onResetStats, onBack, onReplayTutorial }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div style={{ maxWidth: 420, width: "100%", marginTop: "3vh", animation: "bl-rise 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <IconBtn onClick={onBack}>‹ Menu</IconBtn>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, color: "#e8d5b5" }}>
          Settings
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ToggleRow
          label="Sound"
          sub="Wood ticks, wall clacks, win flourish"
          checked={settings.sound}
          onChange={(v) => onChange({ ...settings, sound: v })}
        />
        <ToggleRow
          label="Path hints"
          sub="Show your shortest path on the board"
          checked={settings.hints}
          onChange={(v) => onChange({ ...settings, hints: v })}
        />

        <button
          onClick={onReplayTutorial}
          style={{
            marginTop: 8,
            padding: "16px 18px",
            minHeight: 44,
            borderRadius: 14,
            textAlign: "left",
            border: "1px solid rgba(236,224,205,0.08)",
            background: "rgba(236,224,205,0.04)",
            color: "#e8d5b5",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Replay tutorial
        </button>

        <button
          onClick={() => {
            if (confirmReset) {
              onResetStats();
              setConfirmReset(false);
            } else {
              setConfirmReset(true);
            }
          }}
          style={{
            marginTop: 8,
            padding: "16px 18px",
            minHeight: 44,
            borderRadius: 14,
            textAlign: "left",
            border: confirmReset ? "1px solid #c9695a" : "1px solid rgba(236,224,205,0.08)",
            background: confirmReset ? "rgba(201,105,90,0.12)" : "rgba(236,224,205,0.04)",
            color: confirmReset ? "#e8a89c" : "#e8d5b5",
            fontFamily: "inherit",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {confirmReset ? "Tap again to confirm reset" : "Reset stats"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
        borderRadius: 14,
        background: "rgba(236,224,205,0.04)",
        border: "1px solid rgba(236,224,205,0.08)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#e8d5b5" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#8a7458", marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        style={{
          width: 46,
          height: 28,
          borderRadius: 14,
          border: "none",
          cursor: "pointer",
          position: "relative",
          background: checked ? "#d0a86a" : "rgba(236,224,205,0.15)",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#20160f",
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}
