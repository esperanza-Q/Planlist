import React from 'react';
import './LandingPage.css';
import mascotImg from '../assets/Landing_cat.svg';
import { useNavigate } from 'react-router-dom';

import mascot_background from '../assets/Landing_round01.svg';
import Landing_round from '../assets/Landing_round02.svg';
import Landing_title from '../assets/Landing_title.svg';

import { ReactComponent as PlanlistLogo } from '../assets/Landing_logo.svg';

const LandingPage = () => {
    const navigate = useNavigate(); 

    const handleLoginClick = () => {
        navigate('/signup'); 
    };
  return (
    <div className="landing-container">
        <div className="landing-header">
            <PlanlistLogo/>
        </div>
        <button className="landing-login-button" onClick={handleLoginClick}>
            Signup / Login
        </button>

      <p className="tagline">One calendar, many happy plans!
        <br /> Choose how to repeat and whether to stick with your favorite crew</p>

        <div className="circle-wrapper">
            <div className="mascot-round-wrapper">
                <img src={mascotImg} alt="Planlist mascot" className="mascot-img" />
                <img src={mascot_background} alt="mascot_background" />
            </div>
            <div className="rotating-circle">
                <img src={Landing_round} alt="Landing round" className="rotating-round" />
                <img src={Landing_title} alt="Landing title" className="rotating-text" />
            </div>
        </div>
    </div>
  );
};

export default LandingPage;
