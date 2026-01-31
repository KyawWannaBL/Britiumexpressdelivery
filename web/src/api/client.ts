import axios, { AxiosError } from "axios";

function getBaseUrl(): string {
  const viteEnv = (import.meta as any)?.env;
  const fromVite = viteEnv?.VITE_API_BASE_URL as string | undefined;

  const fromProcess = (typeof process !== "undefined"
    ? (process.env.API_BASE_URL as string | undefined)
    : undefined);

  // Defaulting to the production path seen in your console logs to prevent 404s
  const base = fromVite || fromProcess || "https://cdp.vercel.com/api/v1/projects/britium-ventures-website";
  return base.replace(/\/+$/, ""); 
}

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

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