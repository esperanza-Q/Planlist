// src/api/client.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || ""; // use dev proxy

const getToken = () => localStorage.getItem("accessToken");

/**
 * apiFetch
 *  - auth:
 *      "auto" (default): include Bearer if token exists
 *      "session": never include Bearer (use cookie session)
 *      "jwt": force Bearer if token exists (same as auto with token)
 */
async function apiFetch(path, opts = {}) {
  const {
    method = "GET",
    body = undefined,
    headers = {},
    auth = "auto",
    credentials = "include", // keep cookies for session endpoints
  } = opts;

  const token = getToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  // Auth header
  const authHeader =
    auth === "session"
      ? {}
      : token
      ? { Authorization: `Bearer ${token}` }
      : {};

  // Base headers
  const baseHeaders = {
    Accept: "application/json, text/plain, */*",
    ...authHeader,
    ...headers,
  };

  // Only set JSON content-type if we actually send a non-Form body
  if (!isForm && body != null && !baseHeaders["Content-Type"]) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const fetchOpts = {
    method,
    credentials, // "include" by default: needed for Spring Session/OAuth2 login
    headers: baseHeaders,
    body: isForm ? body : body != null ? JSON.stringify(body) : undefined,
  };

  let res;
  try {
    res = await fetch(url, fetchOpts);
  } catch (networkErr) {
    const err = new Error("Network error");
    err.cause = networkErr;
    throw err;
  }

  // 204 No Content shortcut
  if (res.status === 204) {
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return null;
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();

  // Parse response safely (JSON -> text fallback)
  let data;
  if (ct.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else if (ct.startsWith("text/") || ct.includes("application/text")) {
    data = await res.text();
  } else {
    // generic fallback: try text, then JSON-ish detect
    const raw = await res.text().catch(() => "");
    if (raw && (raw.trim().startsWith("{") || raw.trim().startsWith("["))) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    } else {
      data = raw; // may be empty string
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "string" ? data : data?.message || JSON.stringify(data);
    const err = new Error(`HTTP ${res.status}${message ? `: ${message}` : ""}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (p, opts) => apiFetch(p, { ...(opts || {}) }),

  // session-only helpers (no Bearer)
  getSession: (p, opts) =>
    apiFetch(p, { ...(opts || {}), auth: "session" }),
  postSession: (p, b, opts) =>
    apiFetch(p, { method: "POST", body: b, ...(opts || {}), auth: "session" }),
  deleteSession: (p, b, opts) =>
    apiFetch(p, { method: "DELETE", body: b, ...(opts || {}), auth: "session" }),
  putSession: (p, b, opts) =>
    apiFetch(p, { method: "PUT", body: b, ...(opts || {}), auth: "session" }),


   getSessionJson: (p, opts) =>
    apiFetch(p, {
      ...(opts || {}),
      auth: "session",
      headers: {
        "Content-Type": "application/json",
        ...(opts?.headers || {})
      },
      body:
        opts?.body && typeof opts.body === "object"
          ? JSON.stringify(opts.body)
          : opts?.body
    }),

  // Bearer (auto) helpers
  post: (p, b, opts) => apiFetch(p, { method: "POST", body: b, ...(opts || {}) }),
  put: (p, b, opts) => apiFetch(p, { method: "PUT", body: b, ...(opts || {}) }),
  delete: (p, b, opts) => apiFetch(p, { method: "DELETE", body: b, ...(opts || {}) }),
};
