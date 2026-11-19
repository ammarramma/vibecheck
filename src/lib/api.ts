import type { ApiEnvelope, ScanResponse, ScanResult } from "./types";

const configuredBase = (import.meta.env.VITE_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

// In development the optional Vite proxy makes /v1/* same-origin, which is the
// only way to reach a CORS-allowlisted production API from localhost.
const useDevProxy =
  import.meta.env.DEV && import.meta.env.VITE_DEV_USE_PROXY === "true";

/** Empty only when the dev proxy is active or the env var is missing. */
export const API_BASE_URL = useDevProxy ? "" : configuredBase;
export const SCAN_ENDPOINT = `${API_BASE_URL}/v1/vibecheck/scan`;
export const API_CONFIGURED = useDevProxy || Boolean(configuredBase);

export interface ScanApiErrorInit {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  retryAfterSeconds?: number;
  requestId?: string;
}

/** A predictable, user-presentable API failure. */
export class ScanApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly retryAfterSeconds?: number;
  readonly requestId?: string;

  constructor(init: ScanApiErrorInit) {
    super(init.message);
    this.name = "ScanApiError";
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.retryAfterSeconds = init.retryAfterSeconds;
    this.requestId = init.requestId;
  }
}

function parseRetryAfter(response: Response): number | undefined {
  const value = response.headers.get("Retry-After");
  if (!value) return undefined;
  const seconds = Number.parseInt(value, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

/** details.retry_after_seconds covers proxies that strip the Retry-After header. */
function retryAfterFromDetails(details: unknown): number | undefined {
  if (!details || typeof details !== "object") return undefined;
  const value = (details as Record<string, unknown>).retry_after_seconds;
  const seconds = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

/**
 * details is usually {"reason": "..."} for validation/scanner errors or
 * {"retry_after_seconds": n} for rate limits.
 */
export function describeDetails(details: unknown): string | undefined {
  if (!details) return undefined;
  if (typeof details === "string") return details;
  if (typeof details === "object") {
    const record = details as Record<string, unknown>;
    if (typeof record.reason === "string" && record.reason.trim()) {
      return record.reason;
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }
  return undefined;
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "The scanner rejected that target. Double-check the URL and try again.";
    case 408:
      return "The scan took too long and was cancelled. Try again.";
    case 413:
      return "The request body was too large for the scanner.";
    case 429:
      return "Too many scans from this network. Wait a moment, then try again.";
    case 503:
      return "The scanner is busy right now. Try again in a few seconds.";
    case 504:
      return "The target did not respond before the scan deadline.";
    default:
      return status >= 500
        ? "The scanner hit an unexpected error. Please try again."
        : "The scan could not be completed.";
  }
}

/**
 * POST /v1/vibecheck/scan
 * Throws ScanApiError for every expected failure and rethrows AbortError
 * untouched so callers can distinguish cancellation from a real error.
 */
export async function scanTarget(
  url: string,
  signal?: AbortSignal,
): Promise<ScanResponse> {
  if (!API_CONFIGURED) {
    throw new ScanApiError({
      status: 0,
      code: "missing_api_config",
      message:
        "The scanner API is not configured. Set VITE_API_BASE_URL and rebuild the app.",
    });
  }

  let response: Response;
  try {
    response = await fetch(SCAN_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url } satisfies { url: string }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ScanApiError({
      status: 0,
      code: "network_error",
      message:
        "Could not reach the scanner API. Check your connection or try again shortly.",
    });
  }

  const body = await response.text();
  let payload: ApiEnvelope<ScanResult> | null = null;
  if (body) {
    try {
      payload = JSON.parse(body) as ApiEnvelope<ScanResult>;
    } catch {
      payload = null;
    }
  }

  const requestId =
    payload?.meta?.request_id ??
    response.headers.get("X-Request-ID") ??
    undefined;

  if (!response.ok || !payload?.success || payload.error) {
    const apiError = payload?.error;
    throw new ScanApiError({
      status: response.status,
      code: apiError?.code ?? `http_${response.status}`,
      message: apiError?.message || messageForStatus(response.status),
      details: apiError?.details,
      retryAfterSeconds:
        parseRetryAfter(response) ?? retryAfterFromDetails(apiError?.details),
      requestId,
    });
  }

  if (!payload.data) {
    throw new ScanApiError({
      status: response.status,
      code: "empty_response",
      message: "The scanner returned an empty result. Please try again.",
      requestId,
    });
  }

  return {
    result: payload.data,
    meta: payload.meta,
    requestId,
  };
}
