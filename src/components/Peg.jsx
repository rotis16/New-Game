// Theme-driven piece: a circle whose fill, shadow, and border all come
// from CSS custom properties (see global.css), so it reads correctly
// under every theme without per-theme branching here.
export default function Peg({ color, size = 26, active = false, winning = false }) {
  const player = color === "green" ? "p1" : "p2";
  return (
    <div
      className={`bl-piece ${player}${active ? " is-active" : ""}${winning ? " is-winning" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}
