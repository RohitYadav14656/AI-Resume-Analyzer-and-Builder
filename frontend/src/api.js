import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE) return import.meta.env.VITE_API_BASE;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
      return `${protocol}//${hostname}:5000`;
    }
  }
  return "http://localhost:5000";
};

const API_BASE = getApiBaseUrl();

let _accessToken = null;
let _onLogout = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

export function registerLogoutCallback(fn) {
  _onLogout = fn;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

let _isRefreshing = false;
let _refreshQueue = [];

function processQueue(error, token = null) {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
}

import { toast } from "react-hot-toast";

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/auth/")
    ) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        if (typeof _onLogout === "function") _onLogout();
        toast.error("Session expired. Please log in again.", { id: "session-expired" });
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    // Backend error notifications
    if (error.response?.status === 429) {
      toast.error("Too many requests! Please wait a moment before trying again.", { id: "rate-limit" });
    } else if (error.response?.status >= 500) {
      toast.error(error.response?.data?.message || "Server error occurred. Please try again later.", { id: "server-error" });
    } else if (!error.response && error.code === "ERR_NETWORK") {
      toast.error("Network connection error. Check your internet connection.", { id: "network-error" });
    }

    return Promise.reject(error);
  }
);

export default api;

export async function fetchUserProfile() {
  const { data } = await api.get("/api/user/profile");
  return data;
}

export async function updateUserProfile(profileData) {
  const { data } = await api.put("/api/user/profile", profileData);
  return data;
}

export async function changeUserPassword(passwords) {
  const { data } = await api.post("/api/user/change-password", passwords);
  return data;
}

export async function logUserActivity(action, description) {
  try {
    await api.post("/api/user/activity", { action, description });
  } catch (e) {}
}

export async function exportUserData() {
  const response = await api.get("/api/user/export", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `resumeai-user-data.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function deleteUserAccount() {
  const { data } = await api.delete("/api/user/account");
  return data;
}

export async function fetchPricingConfig() {
  const { data } = await api.get("/api/user/pricing-config");
  return data;
}

export async function upgradeUserSubscription(plan) {
  const { data } = await api.post("/api/user/upgrade-subscription", { plan });
  return data;
}
