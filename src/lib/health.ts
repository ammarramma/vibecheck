import { API_BASE_URL, API_CONFIGURED } from "./api";
import type { ApiEnvelope, HealthInfo } from "./types";

export const HEALTH_ENDPOINT = `${API_BASE_URL}/healthz`;

/** GET /healthz — fails on any non-envelope or non-2xx response. */
export async function checkHealth(signal?: AbortSignal): Promise<HealthInfo> {
  if (!API_CONFIGURED) {
    throw new Error("The scanner API is not configured.");
  }

  const response = await fetch(HEALTH_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });

  const body = await response.text();
  let payload: ApiEnvelope<HealthInfo> | null = null;
  if (body) {
    try {
      payload = JSON.parse(body) as ApiEnvelope<HealthInfo>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success || !payload.data) {
    throw new Error("The scanner API health check failed.");
  }

  return payload.data;
}
