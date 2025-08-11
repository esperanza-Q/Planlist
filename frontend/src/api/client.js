// src/api/client.js
import axios from 'axios';

// CRA의 package.json에 "proxy": "http://localhost:8080"가 있으므로 baseURL은 비워둡니다.
export const api = axios.create({
  baseURL: '',          // 상대경로(/api/...) 그대로 사용
  withCredentials: true // 세션/쿠키 인증 쓰면 활성화, 아니면 false여도 무방
});

// 요청 로그 (최종 URL 확인용)
api.interceptors.request.use((config) => {
  const fullUrl = (config.baseURL || '') + (config.url || '');
  console.log('[API REQ]', config.method?.toUpperCase(), fullUrl, 'params=', config.params);
  return config;
});

// 에러 로그
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log('[API ERR]', err.response?.status, err.config?.url, err.response?.data);
    return Promise.reject(err);
  }
);
