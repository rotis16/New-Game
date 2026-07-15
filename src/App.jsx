import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useGame } from "./hooks/useGame.js";
import { useAiWorker } from "./hooks/useAiWorker.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { sounds, setMuted } from "./sound/audio.js";
import { getLegalMoves, canPlaceWall as canPlaceWallFn, bfsPath, START_WALLS } from "./engine/board.js";
import TitleScreen from "./components/TitleScreen.jsx";
import GameScreen from "./components/GameScreen.jsx";
import StatsScreen from "./components/StatsScreen.jsx";
import SettingsScreen from "./components/SettingsScreen.jsx";
import Tutorial from "./components/Tutorial.jsx";
import { DEFAULT_THEME, THEMES } from "./theme.js";

const DEFAULT_SETTINGS = { sound: true, hints: false, tutorialSeen: false, theme: DEFAULT_THEME };
const DEFAULT_STATS = {
  byDifficulty: { easy: { wins: 0, losses: 0 }, medium: { wins: 0, losses: 0 }, hard: { wins: 0, losses: 0 } },
  streaks: { easy: { type: null, count: 0 }, medium: { type: null, count: 0 }, hard: { type: null, count: 0 } },
};

export default function App() {
  const [settings, setSettings] = useLocalStorage("blocade:settings", DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage("blocade:stats", DEFAULT_STATS);
  const [screen, setScreen] = useState(settings.tutorialSeen ? "title" : "tutorial");
  const [placing, setPlacing] = useState(false);
  const [wallOrientation, setWallOrientation] = useState("h");
  const [hoverWall, setHoverWall] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [aiHighlight, setAiHighlight] = useState(false);
  const [shakeId, setShakeId] = useState(0);

  const { state, start, apply, undoRound } = useGame("ai", "medium");
  const { requestMove } = useAiWorker();
  const recordedResultRef = useRef(null);
  const aiHighlightTimer = useRef(null);
  const aiCancelRef = useRef(null);

  useEffect(() => setMuted(!settings.sound), [settings.sound]);
  useEffect(() => {
    const themeId = settings.theme || DEFAULT_THEME;
    document.documentElement.dataset.theme = themeId;
    const meta = document.querySelector('meta[name="theme-color"]');
    const theme = THEMES.find((t) => t.id === themeId);
    if (meta && theme) meta.setAttribute("content", theme.pageColor);
  }, [settings.theme]);
  useEffect(() => () => clearTimeout(aiHighlightTimer.current), []);

  const { walls, positions, wallsLeft, toMove: turn, winner, mode, difficulty, lastAction, moveCount, history } = state;

  const legalMoves = useMemo(() => {
    if (winner || placing) return [];
    if (mode === "ai" && turn === 2) return [];
    return getLegalMoves(walls, positions, turn);
  }, [walls, positions, turn, winner, placing, mode]);

  const pathHint = useMemo(() => {
    if (mode !== "ai") return null;
    return bfsPath(walls, positions, 1);
  }, [walls, positions, mode]);

  const startGame = useCallback(
    (m, d) => {
      aiCancelRef.current?.();
      setPlacing(false);
      setAiThinking(false);
      setAiHighlight(false);
      start(m, d || "medium");
      setScreen("game");
    },
    [start]
  );

  const doApply = useCallback(
    (action, byPlayer) => {
      apply(action);
      if (action.type === "move") sounds.moveTick();
      else {
        if (byPlayer === 2) sounds.aiWall();
        else sounds.wallClack();
        setShakeId((id) => id + 1);
      }
    },
    [apply]
  );

  const handleCellClick = (row, col) => {
    if (winner || placing) return;
    if (mode === "ai" && turn === 2) return;
    if (legalMoves.some((m) => m.row === row && m.col === col)) {
      doApply({ type: "move", to: { row, col } }, turn);
    }
  };

  const handleWallClick = (type, row, col) => {
    if (winner || (mode === "ai" && turn === 2)) return;
    if (wallsLeft[turn] <= 0) return;
    if (canPlaceWallFn(walls, positions, type, row, col)) {
      doApply({ type: "wall", wallType: type, row, col }, turn);
      setPlacing(false);
    } else {
      sounds.errorThunk();
    }
  };

  const canUndo = mode === "ai" && !winner && turn === 1 && history.length >= 2 && screen === "game";
  const handleUndo = () => {
    if (!canUndo) return;
    aiCancelRef.current?.();
    setAiThinking(false);
    setPlacing(false);
    undoRound(2);
  };

  // Drive the AI's turn in a Web Worker so the UI thread never blocks.
  useEffect(() => {
    if (mode !== "ai" || turn !== 2 || winner || screen !== "game") return;
    setAiThinking(true);
    let cancelled = false;
    const { promise, cancel } = requestMove(walls, positions, wallsLeft, 2, difficulty);
    aiCancelRef.current = cancel;
    promise.then((action) => {
      if (cancelled || !action) {
        setAiThinking(false);
        return;
      }
      doApply(action, 2);
      setAiThinking(false);
      setAiHighlight(true);
      clearTimeout(aiHighlightTimer.current);
      aiHighlightTimer.current = setTimeout(() => setAiHighlight(false), 950);
    });
    return () => {
      cancelled = true;
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, winner, screen, walls, positions, wallsLeft, difficulty]);

  // Record stats once per finished single-player game.
  useEffect(() => {
    if (!winner || mode !== "ai") return;
    const key = `${difficulty}:${moveCount}:${winner}`;
    if (recordedResultRef.current === key) return;
    recordedResultRef.current = key;
    const won = winner === 1;
    setStats((prev) => {
      const cur = prev.byDifficulty[difficulty] ?? { wins: 0, losses: 0 };
      const curStreak = prev.streaks[difficulty] ?? { type: null, count: 0 };
      const type = won ? "win" : "loss";
      const count = curStreak.type === type ? curStreak.count + 1 : 1;
      return {
        byDifficulty: {
          ...prev.byDifficulty,
          [difficulty]: { wins: cur.wins + (won ? 1 : 0), losses: cur.losses + (won ? 0 : 1) },
        },
        streaks: { ...prev.streaks, [difficulty]: { type, count } },
      };
    });
    sounds.winFlourish();
  }, [winner, mode, difficulty, moveCount, setStats]);

  const wallsUsed = START_WALLS - wallsLeft[1] + (START_WALLS - wallsLeft[2]);
  const streak = stats.streaks[difficulty] ?? { type: null, count: 0 };
  const streakLabel = streak.count > 0 ? `${streak.count}${streak.type === "win" ? "W" : "L"}` : "—";

  const finishTutorial = () => {
    setSettings((s) => ({ ...s, tutorialSeen: true }));
    setScreen("title");
  };

  return (
    <>
      <div
        className="bl-root bl-page"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px 40px",
        }}
      >
        {screen === "title" && (
          <TitleScreen
            onStart={startGame}
            onOpenStats={() => setScreen("stats")}
            onOpenSettings={() => setScreen("settings")}
            onOpenTutorial={() => setScreen("tutorial")}
          />
        )}

        {screen === "tutorial" && <Tutorial onFinish={finishTutorial} onSkip={finishTutorial} />}

        {screen === "stats" && <StatsScreen stats={stats} onBack={() => setScreen("title")} />}

        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            onChange={setSettings}
            onResetStats={() => setStats(DEFAULT_STATS)}
            onBack={() => setScreen("title")}
            onReplayTutorial={() => setScreen("tutorial")}
          />
        )}

        {screen === "game" && (
          <GameScreen
            mode={mode}
            difficulty={difficulty}
            positions={positions}
            walls={walls}
            wallsLeft={wallsLeft}
            turn={turn}
            placing={placing}
            setPlacing={setPlacing}
            wallOrientation={wallOrientation}
            setWallOrientation={setWallOrientation}
            winner={winner}
            hoverWall={hoverWall}
            setHoverWall={setHoverWall}
            aiThinking={aiThinking}
            legalMoves={legalMoves}
            lastAction={lastAction}
            aiHighlight={aiHighlight}
            onCellClick={handleCellClick}
            onWallClick={handleWallClick}
            onRestart={() => startGame(mode, difficulty)}
            onMenu={() => setScreen("title")}
            canPlaceWall={(t, r, c) => canPlaceWallFn(walls, positions, t, r, c)}
            moveCount={moveCount}
            wallsUsed={wallsUsed}
            streak={streakLabel}
            onUndo={handleUndo}
            canUndo={canUndo}
            hintsEnabled={settings.hints}
            pathHint={pathHint}
            onToggleHint={() => setSettings((s) => ({ ...s, hints: !s.hints }))}
            shakeId={shakeId}
          />
        )}
      </div>
    </>
  );
}
