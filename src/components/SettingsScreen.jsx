import { useState } from "react";
import { IconBtn, SectionLabel } from "./ui.jsx";
import { THEMES } from "../theme.js";

export default function SettingsScreen({ settings, onChange, onResetStats, onBack, onReplayTutorial }) {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div style={{ maxWidth: 420, width: "100%", marginTop: "3vh", animation: "bl-rise 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <IconBtn onClick={onBack}>‹ Menu</IconBtn>
        <div className="bl-display" style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>
          Settings
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <SectionLabel>Look</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {THEMES.map((t) => (
            <ThemeRow key={t.id} theme={t} active={settings.theme === t.id} onClick={() => onChange({ ...settings, theme: t.id })} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ToggleRow
          label="Sound"
          sub="Move ticks, wall clacks, win flourish"
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
          className="bl-panel"
          style={{
            marginTop: 8,
            padding: "16px 18px",
            minHeight: 44,
            textAlign: "left",
            color: "var(--ink)",
            fontFamily: "inherit",
            fontWeight: 700,
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
            borderRadius: "var(--radius-md)",
            textAlign: "left",
            border: confirmReset ? "1px solid var(--danger)" : "1px solid rgba(var(--ink-rgb), 0.09)",
            background: confirmReset ? "rgba(var(--danger-rgb), 0.12)" : "rgba(var(--ink-rgb), 0.045)",
            color: confirmReset ? "var(--danger)" : "var(--ink)",
            fontFamily: "inherit",
            fontWeight: 700,
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

function ThemeRow({ theme, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 14px",
        minHeight: 44,
        borderRadius: "var(--radius-md)",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
        border: active ? "1.5px solid var(--accent)" : "1.5px solid rgba(var(--ink-rgb), 0.09)",
        background: active ? "rgba(var(--accent-rgb), 0.1)" : "rgba(var(--ink-rgb), 0.03)",
      }}
    >
      <div style={{ display: "flex", flexShrink: 0 }}>
        {theme.swatches.map((hex, i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: hex,
              border: "1px solid rgba(0,0,0,0.15)",
              marginLeft: i === 0 ? 0 : -5,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{theme.name}</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 1 }}>{theme.blurb}</div>
      </div>
      {active && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>Active</div>}
    </button>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div
      className="bl-panel"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 18px",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!checked)} role="switch" aria-checked={checked} className={`bl-toggle-track${checked ? " checked" : ""}`}>
        <div className="bl-toggle-thumb" />
      </button>
    </div>
  );
}
