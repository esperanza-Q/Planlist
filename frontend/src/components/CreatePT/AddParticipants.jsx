// src/components/StandardCreatePage/AddParticipants.jsx (PT)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './AddParticipants.css';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import { ReactComponent as PlusCircle } from '../../assets/plus_circle.svg';
import { ReactComponent as XCircle } from '../../assets/x_circle.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import ProfilePic from "../../assets/ProfilePic.png";
import { api } from "../../api/client";

// helpers
const lc = (v) => (v ?? '').toString().toLowerCase();
const idStr = (v) => (v == null ? null : String(v));

// --- Normalizers for the API shape you shared ---
const normalizeFromApi = (raw) => {
  const friends = Array.isArray(raw?.myFriend) ? raw.myFriend : [];
  const participants = Array.isArray(raw?.participants) ? raw.participants : [];

  const mapFriend = (f, i) => ({
    id: f?.userId ?? `friend-${i}`,
    name: f?.name ?? `Friend ${i}`,
    email: f?.email ?? null,
    displayEmail: f?.email ?? `friend${i}@example.com`,
    profileImage: f?.profileImage ?? f?.profile_image ?? ProfilePic,
  });

  const mapParticipant = (p, i) => {
    // PT uses p.response; normalize to: 'accepted' | 'waiting' | 'rejected'
    const raw = lc(p?.response ?? p?.status ?? 'waiting');
    const status =
      raw === 'accepted' ? 'accepted' :
      raw === 'rejected' || raw === 'declined' ? 'rejected' :
      'waiting';

    return {
      id: p?.userId ?? `participant-${i}`,
      name: p?.name ?? `User ${i}`,
      role: p?.role === 'TRAINER' ? 'TRAINER' : 'TRAINEE',
      isTrainer: p?.role === 'TRAINER',
      status,
      profileImage: p?.profileImage ?? p?.profile_image ?? ProfilePic,
      projectParticipantId:
        p?.projectParticipantId ??
        p?.participantId ??
        p?.projectParticipantID ??
        p?.ppid ??
        null,
      email: p?.email ?? null, // may be absent; fine
    };
  };

  return {
    friends: friends.map(mapFriend),
    participants: participants.map(mapParticipant),
  };
};

const AddParticipants = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [friends, setFriends] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [trainerSelections, setTrainerSelections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllFriends, setShowAllFriends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const projectId = formData?.projectId;

  // ====== fetch & refetch helpers ======
  const fetchingRef = useRef(false);
  const safeFetch = async () => {
    if (!projectId || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const json = await api.getSession(`/api/pt/inviteUser/${projectId}`);
      const { friends, participants } = normalizeFromApi(json);
      setFriends(friends);
      setParticipants(participants);
    } catch (e) {
      console.error('Fetch invite data failed:', e);
    } finally {
      fetchingRef.current = false;
    }
  };

  // Initial load
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    (async () => {
      await safeFetch();
      setLoading(false);
    })();
  }, [projectId]);

  // Gate: allow Next when every participant is ACCEPTED or REJECTED (i.e., no WAITING)
  const pendingCount = participants.filter(p => !['accepted', 'rejected'].includes(lc(p.status))).length;
  const allResolved = pendingCount === 0;

  // Live polling while unresolved + refresh on focus/visibility
  useEffect(() => {
    if (!projectId) return;

    const onFocus = () => safeFetch();
    const onVis = () => { if (!document.hidden) safeFetch(); };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);

    let intervalId = null;
    if (!allResolved) {
      intervalId = setInterval(safeFetch, 6000);
    } else {
      // last sync when all resolved
      safeFetch();
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      if (intervalId) clearInterval(intervalId);
    };
  }, [projectId, allResolved]);

  const toggleTrainerSelection = (key) => {
    setTrainerSelections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const refetch = async () => { await safeFetch(); };

  // Build a live set of invited IDs/emails to filter friends list
  const invitedIds = useMemo(
    () => new Set(participants.map(p => idStr(p.id)).filter(Boolean)),
    [participants]
  );
  const invitedEmails = useMemo(
    () => new Set(participants.map(p => lc(p.email)).filter(Boolean)),
    [participants]
  );

  // Friends shown = not invited + search filter
  const filteredFriends = useMemo(() => {
    const base = friends.filter(f => {
      const fid = idStr(f.id);
      const femail = lc(f.email);
      const hiddenById = fid && invitedIds.has(fid);
      const hiddenByEmail = femail && invitedEmails.has(femail);
      return !hiddenById && !hiddenByEmail;
    });
    if (!searchTerm.trim()) return base;
    const q = lc(searchTerm);
    return base.filter(f => lc(f.name).includes(q) || lc(f.email ?? f.displayEmail).includes(q));
  }, [friends, invitedIds, invitedEmails, searchTerm]);

  const displayedFriends = showAllFriends ? filteredFriends : filteredFriends.slice(0, 3);

  const handleInvite = async (friend) => {
    if (!projectId) { alert('Missing projectId. Create the project first.'); return; }
    if (!friend?.email) { alert('This friend has no email; cannot invite.'); return; }

    const key = friend.email ?? friend.id;
    const role = trainerSelections[key] ? 'TRAINER' : 'TRAINEE';

    try {
      await api.postSession(`/api/pt/inviteUser/${projectId}/invite`, {
        email: friend.email,
        role,
      });

      // Optimistic remove from Friends immediately
      setFriends(prev => prev.filter(f =>
        idStr(f.id) !== idStr(friend.id) && lc(f.email) !== lc(friend.email)
      ));
      setTrainerSelections(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      // Server truth
      await refetch();
    } catch (e) {
      console.error('Failed to invite user:', e);
      alert('Failed to invite user. Please try again.');
    }
  };

  const handleRemove = async (part) => {
    if (!formData?.projectId) { alert('Missing projectId.'); return; }
    const participantId = part?.id;
    if (!participantId) {
      console.error('Missing projectParticipantId on participant:', part);
      alert('Cannot delete: participantId is missing from server data.');
      return;
    }
    try {
      await api.deleteSession(
        `/api/pt/inviteUser/${formData.projectId}/deleteRequest/${participantId}`
      );
      await refetch(); // friend shows up again automatically
    } catch (e) {
      console.error('Failed to delete invitation:', e);
      alert('Failed to delete invitation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="invite-step-container">
        <div className="invite-header">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h2>Add Participants</h2>
        </div>
        <div style={{ padding: 16 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="invite-step-container">
      <div className="invite-header">
        <h2>Add Participants</h2>
      </div>

      <div className="invite-box-wrapper">
        {/* Friends box */}
        <div className="add-box friends-box">
          <div className="friends-header">
            <h3>My Friends</h3>
            <div className="trainer-title">trainer</div>
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

                  <label className="trainer-flag">
                    <input
                      type="checkbox"
                      checked={!!trainerSelections[key]}
                      onChange={() => toggleTrainerSelection(key)}
                    />
                  </label>

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
          <ul className="scrollable-participants-list">
            {participants.map((part, i) => {
              const key = part.id ?? i;
              return (
                <li key={key} className="user-row">
                  <Avatar profileImage={part.profileImage} />
                  <div>
                    <div className="user-name">{part.name}</div>
                    <div className="trainer-label">{part.isTrainer ? 'trainer' : 'trainee'}</div>
                  </div>
                  <span className={`status ${part.status}`}>{(part.status || '').toUpperCase()}</span>
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
        className={`project2-next-button ${(!allResolved || submitting) ? 'is-disabled' : ''}`}
        title={!allResolved ? "Waiting for responses" : "Next"}
        onClick={async () => {
          if (!allResolved) {
            alert(`Everyone must respond before continuing${pendingCount ? ` (${pendingCount} pending)` : ""}. Accepted or Rejected are both okay.`);
            return;
          }
          if (submitting) return;
          setSubmitting(true);
          try {
            // Hit in-progress endpoint (POST then fallback to GET)
            try {
              await api.postSession(`/api/pt/inviteUser/${projectId}/inprogress`, {});
            } catch {
              await api.getSession(`/api/pt/inviteUser/${projectId}/inprogress`);
            }
            updateFormData({ participants });
            nextStep();
          } catch (err) {
            console.error('Failed to set in-progress:', err);
            alert('Failed to set project to in-progress. Please try again.');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <ProjectNextIcon />
      </button>
    </div>
  );
};

const Avatar = ({ profileImage }) => (
  <div className="avatar-circle">
    <img
      className="avatar-image"
      alt="Profile"
      src={profileImage || ProfilePic}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (e.currentTarget.src !== ProfilePic) {
          e.currentTarget.onerror = null;
          e.currentTarget.src = ProfilePic;
        }
      }}
    />
  </div>
);

export default AddParticipants;
