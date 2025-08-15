import React, { useState, useEffect } from 'react';
import '../../components/StandardCreatePage/AddParticipants.css';

import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import { ReactComponent as PlusCircle } from '../../assets/plus_circle.svg';
import { ReactComponent as XCircle } from '../../assets/x_circle.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import ProfilePic from "../../assets/ProfilePic.png";
import { api } from "../../api/client";

// --- normalize API -> UI ---
const normalizeFromApi = (raw) => {
  const friends = Array.isArray(raw?.myFriend) ? raw.myFriend : [];
  const participants = Array.isArray(raw?.participants) ? raw.participants : [];

  const mapFriend = (f, i) => ({
    id: f?.userId ?? `friend-${i}`,
    name: f?.name ?? `Friend ${i}`,
    email: f?.email ?? null,
    displayEmail: f?.email ?? `friend${i}@example.com`,
    profileImage: f?.profile_image ?? ProfilePic,
  });

  const mapParticipant = (p, i) => ({
    id: p?.userId ?? `participant-${i}`,
    projectParticipantId:
      p?.projectParticipantId ??
      p?.participantId ??
      p?.projectParticipantID ??
      p?.ppid ??
      null,
    name: p?.name ?? `User ${i}`,
    status: p?.status ?? 'invited',
    profileImage: p?.profile_image ?? ProfilePic,
  });

  return {
    friends: friends.map(mapFriend),
    participants: participants.map(mapParticipant),
  };
};

const AddParticipants = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [friends, setFriends] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const projectId = formData?.projectId;

  // fetch friends + current participants for this project
  useEffect(() => {
    if (!projectId) {
      setErr("Missing projectId");
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        // ✅ keep endpoint consistent with your PT spec
        const json = await api.getSession(`/api/pt/inviteUser/${projectId}`);
        if (!alive) return;
        const { friends, participants } = normalizeFromApi(json);
        setFriends(friends);
        setParticipants(participants);
      } catch (e) {
        if (!alive) return;
        console.error('Error fetching invite page data:', e);
        setErr(e?.message || "Failed to load data");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [projectId]);

  const refetch = async () => {
    const json = await api.getSession(`/api/pt/inviteUser/${projectId}`);
    const { friends, participants } = normalizeFromApi(json);
    setFriends(friends);
    setParticipants(participants);
  };

  const handleInvite = async (friend) => {
    if (!projectId) { alert('Missing projectId. Create the project first.'); return; }
    if (!friend?.email) { alert('This friend has no email; cannot invite.'); return; }

    try {
      // ✅ no trainer/role — just email
      await api.postSession(`/api/pt/inviteUser/${projectId}/invite`, {
        email: friend.email,
      });
      await refetch();
    } catch (e) {
      console.error('Failed to invite user:', e);
      alert('Failed to invite user. Please try again.');
    }
  };

  const handleRemove = async (part) => {
    if (!projectId) { alert('Missing projectId.'); return; }
    const participantId = part?.projectParticipantId;
    if (!participantId) {
      console.error('Missing projectParticipantId on participant:', part);
      alert('Cannot delete: participantId is missing from server data.');
      return;
    }
    try {
      await api.deleteSession(
        `/api/pt/inviteUser/${projectId}/deleteRequest/${participantId}`
      );
      await refetch();
    } catch (e) {
      console.error('Failed to delete invitation:', e);
      alert('Failed to delete invitation. Please try again.');
    }
  };

  const lc = (v) => (v ?? '').toLowerCase();
  const filteredFriends = friends.filter(f =>
    lc(f.name).includes(lc(searchTerm)) ||
    lc(f.email ?? f.displayEmail).includes(lc(searchTerm))
  );
  const displayedFriends = showAllFriends ? filteredFriends : filteredFriends.slice(0, 3);

  return (
    <div className="invite-step-container">
      <div className="invite-header">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>Add Participants</h2>
      </div>

      {loading && <div style={{ padding: 16 }}>Loading…</div>}
      {!loading && err && (
        <div style={{ padding: 16, color: 'crimson', whiteSpace: 'pre-wrap' }}>
          {err}
        </div>
      )}

      {!loading && !err && (
        <>
          <div className="invite-box-wrapper">
            {/* Friends box */}
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
                {displayedFriends.map((friend, i) => {
                  const key = friend.email ?? friend.id ?? i;
                  return (
                    <li key={key} className="user-row">
                      <div className="friend-porifleRight">
                        <Avatar profileImage={friend.profileImage} />
                        <div>
                          <div className="user-name">{friend.name}</div>
                          <div className="user-email">{friend.email ?? friend.displayEmail}</div>
                        </div>
                      </div>

                      <button className="PlusCircleButton" onClick={() => handleInvite(friend)}>
                        <PlusCircle />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {!showAllFriends && filteredFriends.length > 3 && (
                <button className="see-all-btn" onClick={() => setShowAllFriends(true)}>
                  See all friends
                </button>
              )}
            </div>

            {/* Participants box */}
            <div className="add-box participants-box">
              <h3>Participants</h3>
              {participants.length === 0 && (
                <div className="empty-note">No participants invited yet.</div>
              )}
              <ul className="scrollable-participants-list">
                {participants.map((part, i) => {
                  const key = part.projectParticipantId ?? part.id ?? i;
                  return (
                    <li key={key} className="user-row">
                      <Avatar profileImage={part.profileImage} />
                      <div>
                        <div className="user-name">{part.name}</div>
                        <div className="user-email">{part.email ?? ""}</div>
                      </div>
                      <span className={`status ${part.status}`}>{part.status}</span>
                      <button className='XCircleButton' onClick={() => handleRemove(part)}>
                        <XCircle />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <button
            className="project2-next-button"
            onClick={() => { updateFormData({ participants }); nextStep(); }}
          >
            <ProjectNextIcon />
          </button>
        </>
      )}
    </div>
  );
};

const Avatar = ({ profileImage }) => (
  <div className="avatar-circle">
    <img className="avatar-image" alt="Profile" src={profileImage || ProfilePic} />
  </div>
);

export default AddParticipants;
