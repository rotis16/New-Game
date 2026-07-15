import Peg from "./Peg.jsx";

// Static illustrative hero board for the title screen.
export default function MiniBoard() {
  const N = 5;
  const c = 34;
  const g = 5;
  const px = N * c + (N - 1) * g;
  const green = { row: 4, col: 2 };
  const red = { row: 0, col: 2 };
  const hWall = { row: 2, col: 1 };
  const vWall = { row: 1, col: 3 };

  return (
    <div
      style={{
        position: "relative",
        padding: 12,
        borderRadius: "var(--radius-md)",
        background: "var(--board-frame-bg)",
        boxShadow: "var(--shadow-card)",
        border: "var(--outline-width) solid var(--outline)",
      }}
    >
      <div style={{ position: "relative", width: px, height: px }}>
        {Array.from({ length: N - 1 }).map((_, i) => (
          <div
            key={`mh${i}`}
            style={{ position: "absolute", left: 0, top: (i + 1) * c + i * g, width: px, height: g, background: "rgba(var(--ink-rgb), 0.12)", borderRadius: g }}
          />
        ))}
        {Array.from({ length: N - 1 }).map((_, i) => (
          <div
            key={`mv${i}`}
            style={{ position: "absolute", top: 0, left: (i + 1) * c + i * g, height: px, width: g, background: "rgba(var(--ink-rgb), 0.12)", borderRadius: g }}
          />
        ))}
        {Array.from({ length: N }).map((_, row) =>
          Array.from({ length: N }).map((_, col) => {
            const alt = (row + col) % 2 === 1;
            const gr = row === 4;
            const rd = row === 0;
            return (
              <div
                key={`mc${row}-${col}`}
                style={{
                  position: "absolute",
                  left: col * (c + g),
                  top: row * (c + g),
                  width: c,
                  height: c,
                  borderRadius: 5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alt ? "var(--tile-b)" : "var(--tile-a)",
                  backgroundImage: "var(--board-texture)",
                  backgroundSize: "var(--board-texture-size)",
                }}
              >
                {(gr || rd) && (
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      opacity: 0.35,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      ...(rd ? { borderBottom: "5px solid var(--p2)" } : { borderTop: "5px solid var(--p1)" }),
                    }}
                  />
                )}
              </div>
            );
          })
        )}
        <div style={{ position: "absolute", left: green.col * (c + g), top: green.row * (c + g), width: c, height: c, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
          <Peg color="green" size={c * 0.72} active />
        </div>
        <div style={{ position: "absolute", left: red.col * (c + g), top: red.row * (c + g), width: c, height: c, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4 }}>
          <Peg color="red" size={c * 0.72} />
        </div>
        <div
          style={{
            position: "absolute",
            left: hWall.col * (c + g) - 1,
            top: hWall.row * (c + g) + c - 1,
            width: c * 2 + g + 2,
            height: g + 2,
            borderRadius: g,
            zIndex: 6,
            background: "var(--wall-color)",
            boxShadow: "var(--wall-shadow)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: vWall.col * (c + g) + c - 1,
            top: vWall.row * (c + g) - 1,
            width: g + 2,
            height: c * 2 + g + 2,
            borderRadius: g,
            zIndex: 6,
            background: "var(--wall-color)",
            boxShadow: "var(--wall-shadow)",
          }}
        />
      </div>
    </div>
  );
}
