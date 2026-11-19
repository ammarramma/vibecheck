import { useCallback, useEffect, useRef, useState } from "react";
import { API_CONFIGURED } from "@/lib/api";
import { checkHealth } from "@/lib/health";
import type { HealthInfo } from "@/lib/types";

export type ApiHealthStatus = "checking" | "online" | "offline";

const POLL_INTERVAL_MS = 45_000;

/**
 * Tiny liveness probe for the mapi backend. Polls /healthz while the tab is
 * open and re-checks when the tab becomes visible again.
 */
export function useApiHealth() {
  const [status, setStatus] = useState<ApiHealthStatus>(
    API_CONFIGURED ? "checking" : "offline",
  );
  const [info, setInfo] = useState<HealthInfo | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!API_CONFIGURED) {
      setStatus("offline");
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data = await checkHealth(controller.signal);
      if (controller.signal.aborted) return;
      setInfo(data);
      setStatus("online");
    } catch {
      if (controller.signal.aborted) return;
      setInfo(null);
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    if (!API_CONFIGURED) return;

    void refresh();
    const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      controllerRef.current?.abort();
    };
  }, [refresh]);

  return { status, info, refresh };
}
