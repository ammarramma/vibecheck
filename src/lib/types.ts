/** Wire types mirroring mapi/internal/services/vibecheck/model.go. */

export type CheckStatus = "pass" | "warn" | "fail" | "skip" | "info";

export type ScanCategory = "transport" | "headers" | "exposure" | "secrets";

export interface ScanRequest {
  url: string;
}

export interface TargetInfo {
  url: string;
  final_url: string;
  status_code: number;
  server?: string;
  tls_version?: string;
}

export interface Summary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  skipped: number;
  info: number;
}

export interface CategoryScore {
  category: ScanCategory;
  score: number;
  passed: number;
  warnings: number;
  failed: number;
  skipped: number;
}

export interface CheckItem {
  id: string;
  category: ScanCategory;
  title: string;
  status: CheckStatus;
  detail?: string;
  evidence?: string;
}

export interface ScanResult {
  target: TargetInfo;
  scanned_at: string;
  duration_ms: number;
  score: number;
  grade: string;
  summary: Summary;
  categories: CategoryScore[];
  checks: CheckItem[];
}

/** GET /healthz on the mapi backend. */
export interface HealthInfo {
  service: string;
  status: string;
  uptime_seconds?: number;
  version?: string;
}

/** The scan payload plus envelope metadata (request id, server timestamp). */
export interface ScanResponse {
  result: ScanResult;
  meta?: ApiMeta;
  requestId?: string;
}

/** Shared envelope from mapi/internal/shared/response.go. */
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  request_id?: string;
  timestamp?: string;
  extra?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
  meta?: ApiMeta;
}
