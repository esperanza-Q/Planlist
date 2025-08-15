import { api as client } from './client';

// 로그인
export async function login({ email, password }) {
  const res = await client.post("/api/users/login", { email, password });

  // 토큰 반환형 가정 1: { accessToken, refreshToken?, user? }
  if (res.data?.accessToken && authMode.current === "token") {
    localStorage.setItem("accessToken", res.data.accessToken);
  }
  // 쿠키 기반이라면 서버가 Set-Cookie 내려주므로 클라이언트 저장 불필요

  return res.data; // {user, ...} 등 백엔드 응답 그대로 넘김
}

// 회원가입
export async function signup({ email, name, password, confirmPassword }) {
  const res = await client.post("/api/auth/signup", {
    email, name, password, confirmPassword
  });
  return res.data;
}

// 내 정보
// api/auth.js
export async function getMe() {
  const res = await client.get("/api/users/me");
  return res.data;
}

// 로그아웃(옵션): 토큰 모드면 로컬 토큰 제거
export function logoutLocal() {
  localStorage.removeItem("accessToken");
}


export const authMode = { current: 'cookie' };