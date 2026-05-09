/**
 * API Client — Axios wrapper with JWT authentication
 */
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("edusign_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (expired/invalid token)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("edusign_token");
      localStorage.removeItem("edusign_user");
      // Only redirect if not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────
export const authAPI = {
  register: (username, password) =>
    client.post("/auth/register", { username, password }),

  login: (username, password) =>
    client.post("/auth/login", { username, password }),

  getMe: () => client.get("/auth/me"),

  getUsers: () => client.get("/auth/users"),
};

// ── Documents API ─────────────────────────────
export const documentsAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return client.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  sign: (documentId) =>
    client.post("/documents/sign", { document_id: documentId }),

  send: (documentId, receiverId) =>
    client.post("/documents/send", {
      document_id: documentId,
      receiver_id: receiverId,
    }),

  getInbox: () => client.get("/documents/inbox"),

  getSent: () => client.get("/documents/sent"),

  getDocument: (docId) => client.get(`/documents/${docId}`),

  download: (docId) =>
    client.get(`/documents/${docId}/download`, { responseType: "blob" }),

  tamper: (docId) => client.post(`/documents/${docId}/tamper`),
};

// ── Crypto API ────────────────────────────────
export const cryptoAPI = {
  verify: (docId) => client.post(`/crypto/verify/${docId}`),
};

export default client;
