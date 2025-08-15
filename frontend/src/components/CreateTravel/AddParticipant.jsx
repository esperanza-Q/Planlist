// src/components/CreateTravel/AddParticipant.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../../components/StandardCreatePage/AddParticipants.css';

import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import { ReactComponent as PlusCircle } from '../../assets/plus_circle.svg';
import { ReactComponent as XCircle } from '../../assets/x_circle.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";

import ProfilePic from "../../assets/ProfilePic.png";
import { api } from "../../api/client";

// helpers
const lc = (v) => (v ?? '').toString().toLowerCase();
const str = (v) => (v == null ? null : String(v));
const b64urlToB64 = (s) => s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
const parseJwt = (token) => {
  if (!token || typeof token !== 'string' || token.split('.').length < 2) return null;
  try { return JSON.parse(atob(b64urlToB64(token.split('.')[1]))); } catch { return null; }
};

// ✅ only "accepted" counts
const isAcceptedStatus = (s) => lc(s) === 'accepted';

/* ----------------- identify current user (robust) ----------------- */
const getAuthUserLoose = (formData, participantsRaw) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const p = parseJwt(token) || {};
  let id = p.userId ?? p.id ?? p.sub ?? null;
  let email = p.email ?? p.preferred_username ?? p.userEmail ?? null;

  id = id ?? localStorage.getItem('userId') ?? localStorage.getItem('id');
  email = email ?? localStorage.getItem('userEmail') ?? localStorage.getItem('email') ?? localStorage.getItem('username');

  const ownerId = formData?.project?.ownerId ?? formData?.project?.userId ?? formData?.ownerId ?? null;
  const ownerEmail = formData?.project?.ownerEmail ?? formData?.ownerEmail ?? null;
  id = id ?? ownerId;
  email = email ?? ownerEmail;

  const ownerLike = (participantsRaw || []).find((p) =>
    ['owner','host','creator','leader','관리자','주최','생성'].includes(lc(p?.role ?? p?.status))
  );
  const hintedEmail = ownerLike?.email ?? ownerLike?.userEmail ?? ownerLike?.username ?? null;
  const hintedId = ownerLike?.userId ?? ownerLike?.id ?? null;

  id = id ?? hintedId;
  email = email ?? hintedEmail;

  return { id: id != null ? str(id) : null, email: email != null ? lc(email) : null };
};
const isSelf = (person, self) => {
  if (!person || !self) return false;
  const pid = str(person.userId ?? person.id ?? null);
  const pemail = lc(person.email ?? person.userEmail ?? person.displayEmail ?? person.username ?? null);
  return (pid && self.id && pid === self.id) || (pemail && self.email && pemail === self.email);
};
/* ------------------------------------------------------------------ */

// --- normalize API -> UI ---
const normalizeFromApi = (raw) => {
  const friends = Array.isArray(raw?.myFriend) ? raw.myFriend : [];
  const participants = Array.isArray(raw?.participants) ? raw.participants : [];

  const mapFriend = (f, i) => ({
    id: f?.userId ?? f?.id ?? `friend-${i}`,
    name: f?.name ?? f?.nickname ?? `Friend ${i}`,
    email: f?.email ?? f?.userEmail ?? f?.username ?? null,
    displayEmail: f?.email ?? f?.userEmail ?? f?.username ?? `friend${i}@example.com`,
    profileImage: f?.profileImage ?? f?.profile_image ?? ProfilePic, // server key
  });

  const mapParticipant = (p, i) => {
    // server sends "response": "ACCEPTED" | "WAITING"
    const normalizedStatus = (() => {
      const s = lc(p?.response ?? p?.status ?? 'waiting');
      if (s === 'accepted') return 'accepted';
      if (s === 'waiting') return 'waiting';
      return s;
    })();
    return {
      id: p?.userId ?? p?.id ?? p?.user?.id ?? `participant-${i}`,
      projectParticipantId:
        p?.projectParticipantId ??
        p?.participantId ??
        p?.projectParticipantID ??
        p?.ppid ??
        null,
      name: p?.name ?? p?.nickname ?? p?.user?.name ?? `User ${i}`,
      email: p?.email ?? p?.userEmail ?? p?.username ?? p?.user?.email ?? null,
      role: p?.role ?? null,
      isTrainer: false,
      status: normalizedStatus, // <- used by gate
      profileImage: p?.profileImage ?? p?.profile_image ?? p?.user?.profileImage ?? ProfilePic,
    };
  };

  return { friends: friends.map(mapFriend), participants: participants.map(mapParticipant) };
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

  // ===== reload helpers (safe fetch + polling + focus/visibility) =====
  const fetchingRef = useRef(false);
  const safeFetch = async () => {
    if (!projectId || fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const json = await api.getSession(`/api/travel/inviteUser/${projectId}`);
      const normalized = normalizeFromApi(json);
      const self = getAuthUserLoose(formData, normalized.participants);

      const nf = normalized.friends.filter((f) => !isSelf(f, self));
      const np = normalized.participants.filter((p) => !isSelf(p, self));

      setFriends(nf);
      setParticipants(np);
      setErr("");
    } catch (e) {
      console.error('Error fetching invite page data:', e);
      setErr(e?.message || "Failed to load data");
    } finally {
      fetchingRef.current = false;
    }
  };

  // initial load
  useEffect(() => {
    if (!projectId) { setErr("Missing projectId"); setLoading(false); return; }
    setLoading(true);
    (async () => {
      await safeFetch();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, formData]);

  // derive pending & set up polling + focus/visibility refresh
  const pendingCount = participants.filter((p) => !isAcceptedStatus(p.status)).length;
  const allAccepted = pendingCount === 0;

  useEffect(() => {
    if (!projectId) return;

    const onFocus = () => safeFetch();
    const onVis = () => { if (!document.hidden) safeFetch(); };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);

    let intervalId = null;
    if (!allAccepted) {
      intervalId = setInterval(safeFetch, 6000);
    } else {
      // one last sync when everyone accepted
      safeFetch();
    }

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, allAccepted]);

  const refetch = async () => { await safeFetch(); };

  const handleInvite = async (friend) => {
    if (!projectId) { alert('Missing projectId. Create the project first.'); return; }
    if (!friend?.email) { alert('This friend has no email; cannot invite.'); return; }

    const self = getAuthUserLoose(formData, participants);
    if (isSelf(friend, self)) return;

    try {
      await api.postSession(`/api/travel/inviteUser/${projectId}/invite`, { email: friend.email });
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
      await api.deleteSession(`/api/travel/inviteUser/${projectId}/deleteRequest/${participantId}`);
      await refetch();
    } catch (e) {
      console.error('Failed to delete invitation:', e);
      alert('Failed to delete invitation. Please try again.');
    }
  };

  const filteredFriends = friends.filter(f =>
    lc(f.name).includes(lc(searchTerm)) || lc(f.email ?? f.displayEmail).includes(lc(searchTerm))
  );
  const displayedFriends = showAllFriends ? filteredFriends : filteredFriends.slice(0, 3);

  return (
    <div className="invite-step-container">
      <div className="invite-header">
        <h2>Add Participants</h2>
      </div>

      {loading && <div style={{ padding: 16 }}>Loading…</div>}
      {!loading && err && (
        <div style={{ padding: 16, color: 'crimson', whiteSpace: 'pre-wrap' }}>{err}</div>
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
                        <Avatar profileImage={friend.profileImage || ProfilePic} />
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
              <ul className="scrollable-participants-list">
                {participants.map((part, i) => {
                  const key = part.id ?? part.email ?? i;
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
            className="project2-next-button"
            title="Next"
            onClick={() => {
              // keep your current behavior (no alert gate here)
              updateFormData({ participants });
              nextStep();
            }}
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
