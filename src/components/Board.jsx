import { useState, useEffect, useRef } from "react";
import { SIZE } from "../engine/board.js";
import Peg from "./Peg.jsx";

export default function Board({
  walls,
  positions,
  legalMoves,
  turn,
  placing,
  wallOrientation,
  winner,
  hoverWall,
  setHoverWall,
  onCellClick,
  onWallClick,
  canPlaceWall,
  lastAction,
  aiHighlight,
  pathHint,
  myTurn,
  shakeId,
}) {
  const wrapRef = useRef(null);
  const [cell, setCell] = useState(44);
  const gap = 8;

  useEffect(() => {
    const resize = () => {
      const w = wrapRef.current?.clientWidth || 360;
      const avail = Math.min(w - 52, 480);
      setCell(Math.max(30, Math.floor((avail - (SIZE - 1) * gap) / SIZE)));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const boardPx = SIZE * cell + (SIZE - 1) * gap;
  const posFor = (row, col) => ({ left: col * (cell + gap), top: row * (cell + gap) });
  const hintSet = pathHint ? new Set(pathHint.map((p) => `${p.row}-${p.col}`)) : null;
  const turnColorRgb = turn === 1 ? "var(--p1-rgb)" : "var(--p2-rgb)";

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <div
        key={shakeId}
        style={{
          position: "relative",
          background: "var(--board-frame-bg)",
          borderRadius: "var(--radius-lg)",
          padding: 18,
          boxShadow: "var(--shadow-card)",
          border: "var(--outline-width) solid var(--outline)",
          animation: shakeId ? "bl-shake 0.28s ease" : "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: boardPx + 16,
            height: boardPx + 16,
            margin: "0 auto",
            padding: 8,
            borderRadius: 14,
            background: "var(--board-inner-bg)",
            boxShadow: "inset 0 3px 10px rgba(var(--ink-rgb), 0.18)",
          }}
        >
          <div style={{ position: "relative", width: boardPx, height: boardPx, margin: "0 auto" }}>
            {Array.from({ length: SIZE - 1 }).map((_, i) => (
              <div
                key={`gh-${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  top: (i + 1) * cell + i * gap,
                  width: boardPx,
                  height: gap,
                  background: "rgba(var(--ink-rgb), 0.12)",
                  borderRadius: gap,
                  pointerEvents: "none",
                }}
              />
            ))}
            {Array.from({ length: SIZE - 1 }).map((_, i) => (
              <div
                key={`gv-${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: (i + 1) * cell + i * gap,
                  height: boardPx,
                  width: gap,
                  background: "rgba(var(--ink-rgb), 0.12)",
                  borderRadius: gap,
                  pointerEvents: "none",
                }}
              />
            ))}

            {Array.from({ length: SIZE }).map((_, row) =>
              Array.from({ length: SIZE }).map((_, col) => {
                const isGoalP1 = row === 0;
                const isGoalP2 = row === SIZE - 1;
                const isLegal = legalMoves.some((m) => m.row === row && m.col === col);
                const p1Here = positions[1].row === row && positions[1].col === col;
                const p2Here = positions[2].row === row && positions[2].col === col;
                const onHint = hintSet?.has(`${row}-${col}`) && !p1Here && !p2Here;
                const alt = (row + col) % 2 === 1;
                return (
                  <div
                    key={`c-${row}-${col}`}
                    onClick={() => onCellClick(row, col)}
                    data-testid={`cell-${row}-${col}`}
                    data-legal={isLegal || undefined}
                    style={{
                      position: "absolute",
                      ...posFor(row, col),
                      width: cell,
                      height: cell,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isLegal ? "pointer" : "default",
                      backgroundColor: alt ? "var(--tile-b)" : "var(--tile-a)",
                      backgroundImage: "var(--board-texture)",
                      backgroundSize: "var(--board-texture-size)",
                    }}
                  >
                    {(isGoalP1 || isGoalP2) && !p1Here && !p2Here && (
                      <div
                        style={{
                          width: 0,
                          height: 0,
                          opacity: 0.4,
                          borderLeft: `${cell * 0.14}px solid transparent`,
                          borderRight: `${cell * 0.14}px solid transparent`,
                          ...(isGoalP1
                            ? { borderBottom: `${cell * 0.16}px solid var(--p1)` }
                            : { borderTop: `${cell * 0.16}px solid var(--p2)` }),
                        }}
                      />
                    )}
                    {onHint && (
                      <div
                        style={{
                          position: "absolute",
                          inset: cell * 0.32,
                          borderRadius: "50%",
                          background: "rgba(var(--accent-rgb), 0.35)",
                          boxShadow: "inset 0 0 0 1.5px rgba(var(--accent-rgb), 0.6)",
                        }}
                      />
                    )}
                    {isLegal && (
                      <div
                        style={{
                          position: "absolute",
                          width: cell * 0.3,
                          height: cell * 0.3,
                          borderRadius: "50%",
                          background: `rgba(${turnColorRgb}, 0.5)`,
                          boxShadow: `inset 0 1px 2px rgba(0,0,0,0.25), 0 0 0 ${cell * 0.05}px rgba(${turnColorRgb}, 0.14)`,
                          animation: "bl-pop 0.25s ease",
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}

            {Array.from({ length: SIZE - 1 }).map((_, row) =>
              Array.from({ length: SIZE - 1 }).map((_, col) => {
                const placed = walls.h.has(`${row}-${col}`);
                const isLast = lastAction?.type === "wall" && lastAction.wallType === "h" && lastAction.row === row && lastAction.col === col;
                const activeSlot = placing && wallOrientation === "h" && myTurn && !winner;
                const showGhost = activeSlot && hoverWall && hoverWall.type === "h" && hoverWall.row === row && hoverWall.col === col;
                const valid = activeSlot ? canPlaceWall("h", row, col) : false;
                return (
                  <div
                    key={`h-${row}-${col}`}
                    data-testid={`wall-h-${row}-${col}`}
                    onClick={() => activeSlot && onWallClick("h", row, col)}
                    onMouseEnter={() => activeSlot && setHoverWall({ type: "h", row, col })}
                    onMouseLeave={() => setHoverWall(null)}
                    style={{
                      position: "absolute",
                      left: col * (cell + gap) - 2,
                      top: row * (cell + gap) + cell - Math.floor(cell * 0.35),
                      width: cell * 2 + gap + 4,
                      height: gap + Math.floor(cell * 0.7),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: activeSlot ? "pointer" : "default",
                      zIndex: placed || showGhost ? 6 : activeSlot ? 5 : 1,
                      pointerEvents: activeSlot || placed ? "auto" : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: Math.floor(cell * 0.35) - 1,
                        height: gap + 2,
                        borderRadius: gap,
                        background: placed
                          ? "var(--wall-color)"
                          : showGhost
                            ? valid
                              ? "rgba(var(--success-rgb), 0.85)"
                              : "rgba(var(--danger-rgb), 0.85)"
                            : activeSlot
                              ? "rgba(var(--ink-rgb), 0.14)"
                              : "transparent",
                        boxShadow: placed ? "var(--wall-shadow)" : showGhost ? "0 2px 8px rgba(var(--ink-rgb), 0.25)" : "none",
                        animation: isLast ? "bl-snap 0.35s ease" : "none",
                        transition: "background 0.1s",
                      }}
                    />
                    {isLast && aiHighlight && (
                      <div
                        style={{
                          position: "absolute",
                          inset: -6,
                          borderRadius: gap + 6,
                          animation: "bl-glow-ring 0.9s ease-in-out 2",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}

            {Array.from({ length: SIZE - 1 }).map((_, row) =>
              Array.from({ length: SIZE - 1 }).map((_, col) => {
                const placed = walls.v.has(`${row}-${col}`);
                const isLast = lastAction?.type === "wall" && lastAction.wallType === "v" && lastAction.row === row && lastAction.col === col;
                const activeSlot = placing && wallOrientation === "v" && myTurn && !winner;
                const showGhost = activeSlot && hoverWall && hoverWall.type === "v" && hoverWall.row === row && hoverWall.col === col;
                const valid = activeSlot ? canPlaceWall("v", row, col) : false;
                return (
                  <div
                    key={`v-${row}-${col}`}
                    data-testid={`wall-v-${row}-${col}`}
                    onClick={() => activeSlot && onWallClick("v", row, col)}
                    onMouseEnter={() => activeSlot && setHoverWall({ type: "v", row, col })}
                    onMouseLeave={() => setHoverWall(null)}
                    style={{
                      position: "absolute",
                      left: col * (cell + gap) + cell - Math.floor(cell * 0.35),
                      top: row * (cell + gap) - 2,
                      width: gap + Math.floor(cell * 0.7),
                      height: cell * 2 + gap + 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: activeSlot ? "pointer" : "default",
                      zIndex: placed || showGhost ? 6 : activeSlot ? 5 : 1,
                      pointerEvents: activeSlot || placed ? "auto" : "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: Math.floor(cell * 0.35) - 1,
                        width: gap + 2,
                        borderRadius: gap,
                        background: placed
                          ? "var(--wall-color)"
                          : showGhost
                            ? valid
                              ? "rgba(var(--success-rgb), 0.85)"
                              : "rgba(var(--danger-rgb), 0.85)"
                            : activeSlot
                              ? "rgba(var(--ink-rgb), 0.14)"
                              : "transparent",
                        boxShadow: placed ? "var(--wall-shadow)" : showGhost ? "0 2px 8px rgba(var(--ink-rgb), 0.25)" : "none",
                        animation: isLast ? "bl-snap 0.35s ease" : "none",
                        transition: "background 0.1s",
                      }}
                    />
                    {isLast && aiHighlight && (
                      <div
                        style={{
                          position: "absolute",
                          inset: -6,
                          borderRadius: gap + 6,
                          animation: "bl-glow-ring 0.9s ease-in-out 2",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Pawns rendered as standalone positioned elements (not remounted
                per-cell) so left/top transitions produce a real glide. */}
            <div
              style={{
                position: "absolute",
                ...posFor(positions[1].row, positions[1].col),
                width: cell,
                height: cell,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4,
                transition: "left 0.2s ease, top 0.2s ease",
                pointerEvents: "none",
              }}
            >
              <Peg color="green" size={cell * 0.72} active={turn === 1 && !winner} winning={winner === 1} />
            </div>
            <div
              style={{
                position: "absolute",
                ...posFor(positions[2].row, positions[2].col),
                width: cell,
                height: cell,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 4,
                transition: "left 0.2s ease, top 0.2s ease",
                pointerEvents: "none",
              }}
            >
              <Peg color="red" size={cell * 0.72} active={turn === 2 && !winner} winning={winner === 2} />
            </div>

            {aiHighlight && lastAction?.type === "move" && lastAction.player === 2 && (
              <div
                style={{
                  position: "absolute",
                  ...posFor(positions[2].row, positions[2].col),
                  width: cell,
                  height: cell,
                  pointerEvents: "none",
                  zIndex: 3,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: "10%",
                    borderRadius: "50%",
                    border: "2px solid var(--accent)",
                    animation: "bl-highlight-ring 0.9s ease-out",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
