import React, { useState, useEffect } from 'react';
import '../StandardCreatePage/AddParticipants.css';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg'; 
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import { ReactComponent as PlusCircle } from '../../assets/plus_circle.svg';
import { ReactComponent as XCircle } from '../../assets/x_circle.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import axios from 'axios';



const AddParticipants = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [participants, setParticipants] = useState([]);
  const [friends, setFriends] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // 친구 목록 불러오기
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.get(`/api/meeting/inviteUser/${formData.projectId}`);
        setFriends(res.data.myFriend);
      } catch (err) {
        console.error("Failed to fetch friends:", err);
      }
    };
    fetchFriends();
  }, [formData.projectId]);

  // 프로젝트 진행 상태 확인
  useEffect(() => {
    const checkInProgress = async () => {
      try {
        const res = await axios.get(`/api/meeting/inviteUser/${formData.projectId}/inprogress`);
        // 필요 시 상태 업데이트
      } catch (err) {
        console.error("Failed to check project status:", err);
      }
    };
    checkInProgress();
  }, [formData.projectId]);

  const handleInvite = async (friend) => {
  if (participants.find(p => p.email === friend.email)) {
    alert("이미 초대한 참가자입니다.");
    return;
  }

  try {
    await axios.post(
        `/api/meeting/inviteUser/${formData.projectId}/invite`,
        { userEmail: friend.email, role: 'PARTICIPANT' },
        { headers: { 'Content-Type': 'application/json' } }
        );


    setParticipants(prev => [...prev, { ...friend, status: 'waiting' }]);
  } catch (err) {
    console.error("Failed to invite user:", err);
    alert("유저 초대에 실패했습니다. 서버 로그 확인 필요");
  }
};




    const handleRemove = async (participant) => {
    try {
        await axios.delete(`/api/meeting/inviteUser/${formData.projectId}/deleteRequest/${participant.id}`);
        setParticipants(prev => prev.filter(p => p.id !== participant.id));
    } catch (err) {
        console.error("Failed to remove participant:", err);
    }
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
                <button className='XCircleButton' onClick={() => handleRemove(part)}><XCircle /></button>

              </li>
            ))}
          </ul>
        </div>
      </div>
       <button className="project2-next-button" onClick={handleNext}><ProjectNextIcon/></button>
      
    </div>
  );
};

const Avatar = ({ profileImage }) => (
  <div className="avatar-circle">
    <img src={profileImage} alt="avatar" className="avatar-image" />
  </div>
);

export default AddParticipants;
