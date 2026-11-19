import { useCallback, useEffect, useRef, useState } from "react";
import { ScanApiError, scanTarget } from "@/lib/api";
import type { ApiMeta, ScanResult } from "@/lib/types";

export type ScanStatus = "idle" | "loading" | "success" | "error";

const CLIENT_TIMEOUT_MS = 90_000;

export function useScan() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [error, setError] = useState<ScanApiError | Error | null>(null);
  const [activeUrl, setActiveUrl] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort("unmount");
      clearTimer();
    };
  }, [clearTimer]);

  const scan = useCallback(
    async (url: string) => {
      // A new scan always supersedes the previous one.
      abortRef.current?.abort("replaced");
      clearTimer();

      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("loading");
      setResult(null);
      setMeta(null);
      setError(null);
      setActiveUrl(url);
      setElapsedSeconds(0);

      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        if (mountedRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }
      }, 250);

      const timeoutId = window.setTimeout(
        () => controller.abort("timeout"),
        CLIENT_TIMEOUT_MS,
      );

      try {
        const response = await scanTarget(url, controller.signal);
        if (!mountedRef.current || controller.signal.aborted) return;
        setResult(response.result);
        setMeta(
          response.meta
            ? { ...response.meta, request_id: response.meta.request_id ?? response.requestId }
            : response.requestId
              ? { request_id: response.requestId }
              : null,
        );
        setStatus("success");
      } catch (cause) {
        if (!mountedRef.current) return;

        if (controller.signal.aborted) {
          if (controller.signal.reason === "timeout") {
            setError(
              new ScanApiError({
                status: 0,
                code: "client_timeout",
                message:
                  "The scan took too long to finish. The target may be slow — try again.",
              }),
            );
            setStatus("error");
          }
          return;
        }

        setError(
          cause instanceof Error
            ? cause
            : new Error("The scan failed unexpectedly."),
        );
        setStatus("error");
      } finally {
        window.clearTimeout(timeoutId);
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [clearTimer],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort("reset");
    abortRef.current = null;
    clearTimer();
    setStatus("idle");
    setResult(null);
    setMeta(null);
    setError(null);
    setActiveUrl("");
    setElapsedSeconds(0);
  }, [clearTimer]);

  const cancel = useCallback(() => {
    abortRef.current?.abort("cancel");
    abortRef.current = null;
    clearTimer();
    setStatus("idle");
    setResult(null);
    setMeta(null);
    setError(null);
  }, [clearTimer]);

  return {
    status,
    result,
    meta,
    error,
    activeUrl,
    elapsedSeconds,
    scan,
    reset,
    cancel,
  };
}
