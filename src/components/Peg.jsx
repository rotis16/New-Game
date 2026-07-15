// Turned-wood pawn, top-down with dimensional read.
export default function Peg({ color, size = 26, active = false, winning = false }) {
  const palettes = {
    green: {
      hi: "#8fca74",
      light: "#6ba852",
      mid: "#4c8138",
      dark: "#31571f",
      deep: "#1f3a14",
      ring: "rgba(30,55,18,0.55)",
    },
    red: {
      hi: "#e08a76",
      light: "#c26550",
      mid: "#a3402f",
      dark: "#742619",
      deep: "#4a170e",
      ring: "rgba(74,23,14,0.55)",
    },
  };
  const p = palettes[color];
  const r = size / 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.5))",
        animation: winning ? "bl-win-pulse 0.7s ease-in-out infinite" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 50% 42%, ${p.light} 0%, ${p.mid} 52%, ${p.dark} 82%, ${p.deep} 100%)`,
          boxShadow: `inset 0 ${r * 0.09}px ${r * 0.14}px rgba(255,255,255,0.35), inset 0 -${r * 0.14}px ${r * 0.18}px rgba(0,0,0,0.5)`,
          animation: active ? "bl-glow 2s ease-in-out infinite" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "18%",
          borderRadius: "50%",
          border: `1px solid ${p.ring}`,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)",
        }}
      />
      <div style={{ position: "absolute", inset: "34%", borderRadius: "50%", border: `1px solid ${p.ring}` }} />
      <div
        style={{
          position: "absolute",
          inset: "40%",
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${p.hi} 0%, ${p.light} 60%, ${p.mid} 100%)`,
          boxShadow: "inset 0 1px 1px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "16%",
          width: "34%",
          height: "26%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
