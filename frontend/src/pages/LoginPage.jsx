// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import './SignupPage.css';
import calendarImage from '../assets/Signup_Calendar_3d.svg';
import google_logo from "../assets/google_logo.svg";
import { ReactComponent as PlanlistLogo } from '../assets/Planlist_logo_white.svg';
import { useNavigate } from 'react-router-dom';
const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const LoginPage = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
  e.preventDefault();
  setErr('');
  setLoading(true);

  try {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: form.email, password: form.password }),
    });

    const data = await res.json(); // ✅ 한 번만 읽는다

    if (!res.ok) {
      throw new Error(data.message || data.error || '로그인에 실패했습니다.');
    }

    // JWT 토큰 저장
    const token = data.accessToken || data.token || data.jwt;
    if (token) localStorage.setItem('accessToken', token);

    // 로그인 상태 확인
    const meRes = await fetch('/api/users/me', {
      method: 'GET',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const meData = await meRes.json();
    console.log("me 응답:", meRes.status, meData);


    if (!meRes.ok) {
      const meData = await meRes.json(); // ✅ 한 번만 읽기
      throw new Error(meData.message || '로그인 상태 확인에 실패했습니다.');
    }
    
    console.log("me 응답:", meData);

    // 성공하면 홈으로
    setIsAuthenticated(true); 
    navigate('/home');
  } catch (e) {
    setErr(e.message || '로그인 중 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};


const onGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
};
  return (
    <div className="signup-container">
      <div className="signup-left">
        <PlanlistLogo className="signup_logo"/>
        <div className="branding">
          <h2>Shape Your<br />Schedule, Own <br/> Your Time </h2>
          <img src={calendarImage} alt="calendar" />
        </div>
      </div>

      <div className="signup-right">
        <h2>Log in</h2>
        <form className="signup-form" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />

          <button type="submit" className="signup-btn-create" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {err && <div className="signup-error">{err}</div>}

          <div className="signup-divider">Or</div>

          <button type="button" className="signup-btn-google" onClick={onGoogleLogin}>
            <img src={google_logo} alt="google" />
            Login with Google
          </button>

          <p className="signup-login-link">You Don’t have an account? <a href="/Signup">Sign up</a></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
