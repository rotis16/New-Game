// Runs the AI search off the main thread so the UI never blocks/janks
// while "thinking". Talks in plain structured-cloneable messages.
import { aiChooseMove } from "./ai.js";

self.onmessage = (e) => {
  const { requestId, walls, positions, wallsLeft, player, difficulty } = e.data;
  const action = aiChooseMove(walls, positions, wallsLeft, player, difficulty);
  self.postMessage({ requestId, action });
};
