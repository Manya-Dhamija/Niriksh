import type { AnalyzeRequest, DemoSiteSummary, FeasibilityReport } from "../types";

// Resolution order for the backend URL, so this file never needs to be
// rebuilt just to point the deployed app at a different backend:
//   1. window.__NIRIKSH_CONFIG__.apiBaseUrl  -- set at runtime in config.js,
//      the file a person editing the deployed static site actually touches.
//   2. VITE_API_BASE_URL                     -- baked in at build time, for
//      local dev via `.env`.
//   3. http://localhost:8000                 -- local dev fallback.
declare global {
  interface Window {
    __NIRIKSH_CONFIG__?: { apiBaseUrl?: string };
  }
}

const BASE_URL =
  (typeof window !== "undefined" && window.__NIRIKSH_CONFIG__?.apiBaseUrl) ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchDemoSites(): Promise<DemoSiteSummary[]> {
  const res = await fetch(`${BASE_URL}/api/sites`);
  return handle(res);
}

export async function analyzeSite(req: AnalyzeRequest): Promise<FeasibilityReport> {
  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handle(res);
}
