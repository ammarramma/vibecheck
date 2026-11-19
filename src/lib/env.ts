import { API_BASE_URL } from "./api";
import { externalUrl } from "./utils";

/** All outbound links come from the environment — never hardcoded. */
export const PORTFOLIO_URL = externalUrl(import.meta.env.VITE_PORTFOLIO_URL);
export const API_HOST = (() => {
  if (!API_BASE_URL) return undefined;
  try {
    return new URL(API_BASE_URL).host;
  } catch {
    return undefined;
  }
})();
