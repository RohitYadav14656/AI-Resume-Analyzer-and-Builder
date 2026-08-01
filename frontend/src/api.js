/**
 * api.js — Axios instance with automatic JWT refresh + retry
 *
 * Flow:
 * 1. Every request gets the access token from memory (via getAccessToken()).
 * 2. On 401, tries POST /api/auth/refresh once (browser auto-sends HttpOnly cookie).
 * 3. If refresh succeeds → stores new access token, retries original request.
 * 4. If refresh fails → calls onLogout() so the app can clear state.
 */

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// ── In-memory access token store ─────────────────────────────────────────────
// NEVER put the access token in localStorage — memory is safer against XSS.
let _accessToken = null;
let _onLogout = null; // callback set by App to clear auth state

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

export function clearAccessToken() {
  _accessToken = null;
}

/** Called by App.jsx so the interceptor can trigger global logout */
export function registerLogoutCallback(fn) {
  _onLogout = fn;
}

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // sends HttpOnly refreshToken cookie automatically
});

// ── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────────
let _isRefreshing = false;
let _refreshQueue = []; // pending requests while refreshing

function processQueue(error, token = null) {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and if we haven't already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't retry auth endpoints themselves (avoids infinite loops)
      !originalRequest.url.includes("/api/auth/")
    ) {
      if (_isRefreshing) {
        // Queue this request until refresh completes
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
        // Browser auto-sends the HttpOnly refreshToken cookie here
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
        // Tell the app to log out the user
        if (typeof _onLogout === "function") _onLogout();
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
