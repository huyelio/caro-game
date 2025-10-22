/**
 * API SERVICE
 * Handle HTTP requests to backend
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===== AUTH ENDPOINTS =====

export const register = async (username, email, password) => {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};

export const getLeaderboard = async (limit = 10) => {
  const response = await api.get(`/auth/leaderboard?limit=${limit}`);
  return response.data;
};

// ===== HEALTH CHECK =====

export const healthCheck = async () => {
  const response = await api.get("/health");
  return response.data;
};

export default api;
