// src/api/client.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || ""; // 프록시 쓰면 빈 문자열 유지

const getToken = () => localStorage.getItem("accessToken");

async function apiFetch(path, { method = "GET", body, headers } = {}) {
  const token = getToken();
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    method,
    credentials: "include", // 세션/쿠키 인증
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // JWT 인증
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text().catch(() => "");
  const ct = (res.headers.get("content-type") || "").toLowerCase();

  let data = raw;
  if (ct.includes("application/json") || raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
    try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
      // 서버가 content-type만 JSON으로 보내고 실제는 문자열인 경우 → data는 raw 문자열 유지
          data = raw;
    }
  }
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
      }

      return data;
}

export const api = {
  get: (p) => apiFetch(p),
  post: (p, b) => apiFetch(p, { method: "POST", body: b }),
  put: (p, b) => apiFetch(p, { method: "PUT", body: b }),
  delete: (p, b) => apiFetch(p, { method: "DELETE", body: b }),
};
