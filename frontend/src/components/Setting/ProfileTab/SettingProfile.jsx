import React, { useState } from "react";
import ProfileCard from "./ProfileCard.jsx"

import {Link} from "react-router-dom";
import ProfilePic from "../../../assets/ProfilePic.png"
import ProjectCard from "./ProjectCard.jsx";
import './SettingProfile.css'


const ProjectRequests=[
  
    {
      "projectTitle": "Project 1",
      "creator": "name 1",
      "profile_image": ProfilePic
    },
    {
      "projectTitle":  "Project 2",
      "creator": "name 2",
      "profile_image": ProfilePic
    },
    {
      "projectTitle":  "Project 3",
      "creator": "name 3",
      "profile_image": ProfilePic
    }
 
]

const MypageProfile = ({setView}) => {
  const profileInfo = {
    name: "name",
    email: "ex@example.com",
    profilePic: ProfilePic
  };

  return (
    <div className="screen">

      <div className="tab">
        <button onClick={() => setView('profile')} disabled>
          profile
        </button>

        <button onClick={() => setView('friends')}>
          friends
        </button>
      </div>
      <div className="main-content">
        <ProfileCard {...profileInfo}/>
        <ProjectCard projectRequests={ProjectRequests}/>

      </div>
    </div> 
    
  );
};


export default MypageProfile;