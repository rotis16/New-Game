import { IconBtn, SectionLabel } from "./ui.jsx";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function StatsScreen({ stats, onBack }) {
  return (
    <div style={{ maxWidth: 420, width: "100%", marginTop: "3vh", animation: "bl-rise 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <IconBtn onClick={onBack}>‹ Menu</IconBtn>
        <div className="bl-display" style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 20, color: "var(--ink)" }}>
          Stats
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DIFFICULTIES.map((d) => {
          const s = stats.byDifficulty[d] ?? { wins: 0, losses: 0 };
          const streak = stats.streaks[d] ?? { type: null, count: 0 };
          const total = s.wins + s.losses;
          const winPct = total ? Math.round((s.wins / total) * 100) : 0;
          return (
            <div key={d} className="bl-panel" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="bl-display" style={{ fontWeight: 700, fontSize: 17, textTransform: "capitalize", color: "var(--ink)" }}>
                  {d}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{total} played</div>
              </div>
              <div style={{ display: "flex", gap: 18, marginTop: 10 }}>
                <Stat label="Wins" value={s.wins} color="var(--success)" />
                <Stat label="Losses" value={s.losses} color="var(--danger)" />
                <Stat label="Win rate" value={`${winPct}%`} />
                <Stat
                  label="Streak"
                  value={streak.count > 0 ? `${streak.count}${streak.type === "win" ? "W" : "L"}` : "—"}
                  color={streak.type === "win" ? "var(--success)" : streak.type === "loss" ? "var(--danger)" : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      {DIFFICULTIES.every((d) => (stats.byDifficulty[d]?.wins ?? 0) + (stats.byDifficulty[d]?.losses ?? 0) === 0) && (
        <div style={{ marginTop: 20 }}>
          <SectionLabel>No games played yet</SectionLabel>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div className="bl-display" style={{ fontSize: 16, fontWeight: 700, color: color || "var(--ink)" }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}
