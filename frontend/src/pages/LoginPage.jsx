// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import './SignupPage.css';
import calendarImage from '../assets/Signup_Calendar_3d.svg';
import google_logo from "../assets/google_logo.svg";
import { ReactComponent as PlanlistLogo } from '../assets/Planlist_logo_white.svg';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
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
      // 1) 로그인 요청
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 세션 대비(프록시라 same-origin로 처리됨)
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || '로그인에 실패했습니다.');

      // 2) JWT 모드면 저장
      const token = data.accessToken || data.token || data.jwt;
      if (token) localStorage.setItem('accessToken', token);

      // 3) 로그인 상태 확인(+ 사용자 정보 필요시)
      const meRes = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!meRes.ok) throw new Error('로그인 상태 확인에 실패했습니다.');

      // const me = await meRes.json(); // 필요하면 상태/컨텍스트에 저장
      navigate('/home'); // 홈으로
    } catch (e) {
      setErr(e.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = () => {
    // 프록시 사용 시 절대경로 대신 상대경로가 편함
    window.location.href = '/oauth2/authorization/google';
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
