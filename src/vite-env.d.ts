/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** JSON array of { label, url, icon } sponsor entries. */
  readonly VITE_SPONSORS?: string;
  readonly VITE_PORTFOLIO_URL?: string;
  readonly VITE_SITE_URL?: string;

  /** Dev-only: route /v1/* through the Vite proxy to avoid CORS. */
  readonly VITE_DEV_USE_PROXY?: string;
  /** Dev-only: upstream target for the /v1 proxy. */
  readonly VITE_DEV_API_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
