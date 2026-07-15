import { useEffect, useRef, useCallback } from "react";

// Wraps the AI Web Worker with a request/response API and staleness
// protection: if a new request is made before an old one resolves (e.g. the
// player restarts mid-think), the old response is silently dropped.
export function useAiWorker() {
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map());
  const nextIdRef = useRef(0);

  useEffect(() => {
    const pending = pendingRef.current;
    const worker = new Worker(new URL("../engine/ai.worker.js", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (e) => {
      const { requestId, action } = e.data;
      const resolver = pending.get(requestId);
      if (resolver) {
        pending.delete(requestId);
        resolver(action);
      }
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      pending.clear();
    };
  }, []);

  // Returns a function to cancel/ignore this specific request's result.
  const requestMove = useCallback((walls, positions, wallsLeft, player, difficulty) => {
    const requestId = nextIdRef.current++;
    const promise = new Promise((resolve) => {
      pendingRef.current.set(requestId, resolve);
      workerRef.current?.postMessage({ requestId, walls, positions, wallsLeft, player, difficulty });
    });
    const cancel = () => pendingRef.current.delete(requestId);
    return { promise, cancel };
  }, []);

  return { requestMove };
}
