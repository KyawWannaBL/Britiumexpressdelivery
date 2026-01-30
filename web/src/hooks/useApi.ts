// src/hooks/useApi.ts
import { useMemo } from "react";
import axios, { AxiosInstance } from "axios";
import { auth } from "../firebaseconfig";

export function useApi(): AxiosInstance {
  return useMemo(() => {
    const api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
      timeout: 15000,
    });

    api.interceptors.request.use(async (config) => {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    });

    return api;
  }, []);
}
