import React, { useState } from 'react';
import './AddParticipants.css';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg'; 
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import { ReactComponent as PlusCircle } from '../../assets/plus_circle.svg';
import { ReactComponent as XCircle } from '../../assets/x_circle.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import profile1 from "../../assets/ProfilePic.png"
import profile2 from '../../assets/ProfilePic02.svg';
import profile3 from '../../assets/ProfilePic03.svg';
import profile4 from '../../assets/ProfilePic04.svg';

//테스트 데이터 
const mockFriends = [
  { id: 1, name: 'NAME1', email: 'example1@gmail.com', profileImage: profile1 },
  { id: 2, name: 'NAME2', email: 'example2@gmail.com', profileImage: profile2 },
  { id: 3, name: 'NAME3', email: 'example3@gmail.com', profileImage: profile3 },
  { id: 4, name: 'NAME4', email: 'example4@gmail.com', profileImage: profile4 },
  { id: 5, name: 'NAME5', email: 'example5@gmail.com', profileImage: profile1 },
  { id: 6, name: 'NAME6', email: 'example6@gmail.com', profileImage: profile1 },
];

const AddParticipants = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [participants, setParticipants] = useState([]);
  const [friends, setFriends] = useState(mockFriends);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleInvite = (friend) => {
    if (!participants.find(p => p.email === friend.email)) {
      setParticipants(prev => [
        ...prev,
        { ...friend, status: 'waiting' }
      ]);
    }
  };

  const handleRemove = (email) => {
    setParticipants(prev => prev.filter(p => p.email !== email));
  };

  const handleNext = () => {
    updateFormData({ participants });
    nextStep();
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedFriends = showAllFriends ? filteredFriends : filteredFriends.slice(0, 3);

  return (
    <div className="invite-step-container">
      <div className="invite-header">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>Add Participants</h2>
      </div>

      <div className="invite-box-wrapper">
        {/* 왼쪽: My Friends */}
        <div className="add-box friends-box">
          <div className="friends-header">
            <h3>My Friends</h3>
            <button className="search-toggle-btn" onClick={() => setShowSearch(!showSearch)}>
              <SearchIcon className="search-icon" />
            </button>
          </div>

          {showSearch && (
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <ul className="scrollable-friend-list">
            {displayedFriends.map(friend => (
              <li key={friend.email} className="user-row">
                <div className="friend-porifleRight">
                    <Avatar profileImage={friend.profileImage} />
                    <div>
                    <div className="user-name">{friend.name}</div>
                    <div className="user-email">{friend.email}</div>
                    </div>
                </div>
                <button className="PlusCircleButton" onClick={() => handleInvite(friend)}><PlusCircle /></button>
              </li>
            ))}
          </ul>
          {!showAllFriends && filteredFriends.length > 3 && (
            <button className="see-all-btn" onClick={() => setShowAllFriends(true)}>
              See all friends
            </button>
          )}
        </div>

        {/* 오른쪽: Participants */}
        <div className="add-box participants-box">
          <h3>Participants</h3>
          <ul className="scrollable-participants-list">
            {participants.map(part => (
              <li key={part.email} className="user-row">
                <Avatar profileImage={part.profileImage || '../../assets/ProfilePic.png'} />
                <div>
                  <div className="user-name">{part.name}</div>
                  <div className="user-email">{part.email}</div>
                </div>
                <span className={`status ${part.status}`}>
                  {part.status}
                </span>
                <button className='XCircleButton' onClick={() => handleRemove(part.email)}><XCircle /></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
       <button className="project-next-button" onClick={handleNext}><ProjectNextIcon/></button>
      
    </div>
  );
};

const Avatar = ({ profileImage }) => (
  <div className="avatar-circle">
    <img src={profileImage} alt="avatar" className="avatar-image" />
  </div>
);

export default AddParticipants;
