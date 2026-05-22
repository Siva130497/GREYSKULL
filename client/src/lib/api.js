import axios from "axios";
import { getToken, clearSession } from "./storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach Authorization header from saved session on every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and bounce to /
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      const onLogin = window.location.pathname === "/";
      clearSession();
      if (!onLogin) window.location.replace("/");
    }
    return Promise.reject(err);
  }
);
