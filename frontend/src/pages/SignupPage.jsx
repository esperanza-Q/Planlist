// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import './SignupPage.css';
import calendarImage from '../assets/Signup_Calendar_3d.svg';
import google_logo from "../assets/google_logo.svg";
import { ReactComponent as PlanlistLogo } from '../assets/Planlist_logo_white.svg';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');

    // 간단 클라이언트 검증
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setErr('모든 항목을 입력해주세요.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErr('비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.agree) {
      setErr('이용약관과 개인정보 처리방침에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      if (!res.ok) {
        // 서버가 {message: "..."} 또는 {error: "..."}로 보낸다고 가정
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || '회원가입에 실패했습니다.');
      }

      setOk('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      // 잠깐 안내 보여주고 이동
      setTimeout(() => navigate('/login'), 800);
    } catch (e) {
      setErr(e.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    // 백엔드 구글 OAuth 시작 URL로 이동
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
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
        <h2>Create Account</h2>
        <form className="signup-form" onSubmit={onSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={onChange}
            required
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={onChange}
            required
          />

          <label className="signup-checkbox">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={onChange}
            />
            <p>I have read and agreed to the Terms of Service and Privacy Policy</p>
          </label>

          <button
            type="submit"
            className="signup-btn-create"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          {err && <div className="signup-error">{err}</div>}
          {ok && <div className="signup-success">{ok}</div>}

          <div className="signup-divider">Or</div>

          <button type="button" className="signup-btn-google" onClick={onGoogle}>
            <img src={google_logo} alt="google" />
            Login with Google
          </button>

          <p className="signup-login-link">
            Already have an account? <a href="/login">Log In</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
