import { api, setAuthToken, toApiErrorMessage } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: "customer" | "driver" | "admin";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; 
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>("/auth/login", payload);
    setAuthToken(res.data.tokens.accessToken);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>("/auth/register", payload);
    setAuthToken(res.data.tokens.accessToken);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const res = await api.post<AuthTokens>("/auth/refresh", { refreshToken });
    setAuthToken(res.data.accessToken);
    return res.data;
  } catch (err) {
    throw new Error(toApiErrorMessage(err));
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Silently fail
  } finally {
    setAuthToken(null);
  }
}