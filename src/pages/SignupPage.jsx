import React from 'react';
import './SignupPage.css';
import calendarImage from '../assets/Signup_Calendar_3d.svg';
import google_logo from "../assets/google_logo.svg"

import { ReactComponent as PlanlistLogo } from '../assets/Planlist_logo_white.svg';


const SignupPage = () => {
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
        <form className="signup-form">
          <input type="text" placeholder="Full Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <input type="password" placeholder="Confirm Password" />

          <label className="signup-checkbox">
            <input type="checkbox" />
            <p>I have read and agreed to the Terms of Service and Privacy Policy</p>
          </label>

          <button type="submit" className="signup-btn-create">Create Account</button>

          <div className="signup-divider">Or</div>

          <button type="button" className="signup-btn-google">
            <img src={google_logo}  alt="google" />
            Login with Google
          </button>

          <p className="signup-login-link">Already have an account? <a href="/login">Log In</a></p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
