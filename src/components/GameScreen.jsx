import Board from "./Board.jsx";
import WinCelebration from "./WinCelebration.jsx";
import { IconBtn, PlayerPanel, SegBtn, OrientBtn } from "./ui.jsx";

export default function GameScreen(props) {
  const {
    mode,
    difficulty,
    positions,
    walls,
    wallsLeft,
    turn,
    placing,
    setPlacing,
    wallOrientation,
    setWallOrientation,
    winner,
    hoverWall,
    setHoverWall,
    aiThinking,
    legalMoves,
    lastAction,
    aiHighlight,
    onCellClick,
    onWallClick,
    onRestart,
    onMenu,
    canPlaceWall,
    moveCount,
    wallsUsed,
    streak,
    onUndo,
    canUndo,
    hintsEnabled,
    pathHint,
    onToggleHint,
    shakeId,
  } = props;

  const p2Label = mode === "ai" ? "Computer" : "Player 2";
  const myTurn = !(mode === "ai" && turn === 2);

  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <IconBtn onClick={onMenu}>‹ Menu</IconBtn>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: "#e8d5b5" }}>Blocade</div>
        <IconBtn onClick={onRestart}>Restart</IconBtn>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <PlayerPanel color="green" name="You" walls={wallsLeft[1]} active={turn === 1 && !winner} align="left" />
        <PlayerPanel color="red" name={mode === "ai" ? `CPU · ${difficulty}` : "Player 2"} walls={wallsLeft[2]} active={turn === 2 && !winner} align="right" />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#8a7458" }}>Move {moveCount}</div>
        {mode === "ai" && (
          <div style={{ display: "flex", gap: 6 }}>
            <SmallToggle active={hintsEnabled} onClick={onToggleHint}>
              Path hint
            </SmallToggle>
            <SmallToggle onClick={onUndo} disabled={!canUndo}>
              Undo
            </SmallToggle>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: 14, height: 22, fontSize: 14, fontWeight: 500, color: "#c4b299" }}>
        {winner ? (
          <span style={{ color: "#e8d5b5", fontWeight: 600 }}>{winner === 1 ? "You win!" : `${p2Label} wins`}</span>
        ) : mode === "ai" && turn === 2 ? (
          <span style={{ animation: "bl-pulse 1.2s ease-in-out infinite" }}>{aiThinking ? "Computer is thinking…" : "Computer's turn"}</span>
        ) : (
          <span>{placing ? "Tap a groove to drop a wall" : `${turn === 1 ? "Your" : "Player 2's"} move`}</span>
        )}
      </div>

      <Board
        walls={walls}
        positions={positions}
        legalMoves={legalMoves}
        turn={turn}
        placing={placing}
        wallOrientation={wallOrientation}
        winner={winner}
        hoverWall={hoverWall}
        setHoverWall={setHoverWall}
        onCellClick={onCellClick}
        onWallClick={onWallClick}
        canPlaceWall={canPlaceWall}
        lastAction={lastAction}
        aiHighlight={aiHighlight}
        pathHint={hintsEnabled ? pathHint : null}
        myTurn={myTurn}
        shakeId={shakeId}
      />

      {!winner && myTurn && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 8, padding: 5, borderRadius: 14, background: "rgba(236,224,205,0.05)" }}>
            <SegBtn active={!placing} onClick={() => setPlacing(false)}>
              Move
            </SegBtn>
            <SegBtn active={placing} disabled={wallsLeft[turn] <= 0} onClick={() => setPlacing(true)}>
              Wall · {wallsLeft[turn]}
            </SegBtn>
          </div>
          {placing && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <OrientBtn active={wallOrientation === "h"} onClick={() => setWallOrientation("h")}>
                <span style={{ fontSize: 16 }}>▬</span> Across
              </OrientBtn>
              <OrientBtn active={wallOrientation === "v"} onClick={() => setWallOrientation("v")}>
                <span style={{ fontSize: 16 }}>▮</span> Down
              </OrientBtn>
            </div>
          )}
        </div>
      )}

      {winner && (
        <WinCelebration
          winner={winner}
          mode={mode}
          difficulty={difficulty}
          moveCount={moveCount}
          wallsUsed={wallsUsed}
          streak={streak}
          onRematch={onRestart}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}

function SmallToggle({ children, active, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 12px",
        minHeight: 36,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        border: active ? "1px solid #d0a86a" : "1px solid rgba(236,224,205,0.12)",
        background: active ? "rgba(208,168,106,0.14)" : "transparent",
        color: active ? "#f4e8d4" : "#a89072",
      }}
    >
      {children}
    </button>
  );
}
