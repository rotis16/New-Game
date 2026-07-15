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
        borderRadius: 16,
        background: "linear-gradient(155deg, #4a3320 0%, #2e2011 55%, #1c1207 100%)",
        boxShadow: "0 20px 44px rgba(0,0,0,0.55), inset 0 2px 0 rgba(236,224,205,0.08), inset 0 -2px 6px rgba(0,0,0,0.4)",
        border: "1px solid rgba(140,100,60,0.3)",
      }}
    >
      <div style={{ position: "relative", width: px, height: px }}>
        {Array.from({ length: N - 1 }).map((_, i) => (
          <div
            key={`mh${i}`}
            style={{ position: "absolute", left: 0, top: (i + 1) * c + i * g, width: px, height: g, background: "rgba(0,0,0,0.3)", borderRadius: g }}
          />
        ))}
        {Array.from({ length: N - 1 }).map((_, i) => (
          <div
            key={`mv${i}`}
            style={{ position: "absolute", top: 0, left: (i + 1) * c + i * g, height: px, width: g, background: "rgba(0,0,0,0.3)", borderRadius: g }}
          />
        ))}
        {Array.from({ length: N }).map((_, row) =>
          Array.from({ length: N }).map((_, col) => {
            const shade = ((row * 7 + col * 13) % 5) - 2;
            const b = 196 + shade * 3;
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
                  background: `linear-gradient(155deg, rgb(${b},${b - 38},${b - 92}) 0%, rgb(${b - 20},${b - 58},${b - 116}) 100%)`,
                  boxShadow: "inset 0 1px 1px rgba(255,240,215,0.3), inset 0 -2px 3px rgba(90,60,30,0.4)",
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
                      ...(rd ? { borderBottom: "5px solid rgba(168,72,58,0.9)" } : { borderTop: "5px solid rgba(74,124,63,0.9)" }),
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
            background: "linear-gradient(180deg, #f0d6a2 0%, #d9ab68 45%, #b5823f 100%)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 1px rgba(90,55,20,0.5)",
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
            background: "linear-gradient(90deg, #f0d6a2 0%, #d9ab68 45%, #b5823f 100%)",
            boxShadow: "3px 0 6px rgba(0,0,0,0.55), inset 1px 0 0 rgba(255,255,255,0.5), inset -1px 0 1px rgba(90,55,20,0.5)",
          }}
        />
      </div>
    </div>
  );
}
