import React from 'react';
import './SignupPage.css';
import calendarImage from '../assets/Signup_Calendar_3d.svg';
import google_logo from "../assets/google_logo.svg"

import { ReactComponent as PlanlistLogo } from '../assets/Planlist_logo_white.svg';


const LoginPage = () => {
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
        <h2>Login in</h2>
        <form className="signup-form">
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />

          <button type="submit" className="signup-btn-create">Login</button>

          <div className="signup-divider">Or</div>

          <button type="button" className="signup-btn-google">
            <img src={google_logo}  alt="google" />
            Login with Google
          </button>

          <p className="signup-login-link">You Don’t have an account? <a href="/Signup">Sign up</a></p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
