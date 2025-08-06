import React, { useState } from "react";

import FriendCard from "./FriendCard";
import  FriendRequestCard  from "./FriendRequestCard";
import AddFriendCard from "./AddFriendCard";
import ProfilePic from "../../../assets/ProfilePic.png"
import "./SettingFriends.css"


const FriendRequests=[
  
    {
			"userId" : "userId1",
			"name" : "name1",
			"email" : "example1@email.com",
			"profile_image" : ProfilePic
		},
		{
			"userId" : "userId2",
			"name" : "name2",
			"email" : "example2@email.com",
			"profile_image" : ProfilePic
		},
		{
			"userId" : "userId3",
			"name" : "name3",
			"email" : "example3@email.com",
			"profile_image" : ProfilePic
		}
 
]

const friends = [
    { "name": "John Doe", "email": "john.doe@example.com" ,
			"profile_image" : ProfilePic},
    { "name": "Jane Smith", "email": "jane.smith@example.com" ,
			"profile_image" : ProfilePic},
    { "name": "Robert Johnson", "email": "robert@example.com" ,
			"profile_image" : ProfilePic},
    { "name": "Emily Davis", "email": "emily@example.com" ,
			"profile_image" : ProfilePic},
    { "name": "Robert Johnson", "email": "robert@example.com" ,
			"profile_image" : ProfilePic}
   
];

const Setting_friends = ({setView}) => {
  

  return (
    <div className="screen">

      <div className="tab">
        <button onClick={() => setView('profile')} >
          profile
        </button>

        <button onClick={() => setView('friends')} disabled>
          friends
        </button>
      </div>

        {/* Friends List Card */}
        <FriendCard friends={friends}/>
      
      <div className="LayoutDiv">
        {/* Add Friend Card */}
        <AddFriendCard/>

        {/* Friend Requests Card */}
        <FriendRequestCard friendRequests={FriendRequests}/>
      

      </div>
        
    </div>
  );
};


export default Setting_friends;
