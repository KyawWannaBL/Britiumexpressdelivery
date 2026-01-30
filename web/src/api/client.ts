// src/api/client.ts
import axios, { AxiosError } from "axios";

function getBaseUrl(): string {
  // Vite (web)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteEnv = (import.meta as any)?.env;
  const fromVite = viteEnv?.VITE_API_BASE_URL as string | undefined;

  // Node / some RN setups (if you use a env library)
  const fromProcess = (typeof process !== "undefined"
    ? (process.env.API_BASE_URL as string | undefined)
    : undefined);

  const base = fromVite || fromProcess || "http://localhost:3000/api";
  return base.replace(/\/+$/, ""); // trim trailing slashes
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// If you use auth tokens, set them once here:
export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function toApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError<any>;
    return (
      ae.response?.data?.message ||
      ae.response?.data?.error ||
      ae.message ||
      "Request failed"
    );
  }
  return "Unknown error";
}
