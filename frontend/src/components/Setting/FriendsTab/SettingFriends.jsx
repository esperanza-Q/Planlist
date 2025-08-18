// SettingFriends.jsx
import React, { useEffect, useState } from "react";
import FriendCard from "./FriendCard";
import FriendRequestCard from "./FriendRequestCard";
import AddFriendCard from "./AddFriendCard";
import ProfilePic from "../../../assets/ProfilePic.png";
import "./SettingFriends.css";
import { api } from "../../../api/client";

// SettingFriends.jsx
// SettingFriends.jsx
const normalize = (raw) => {
  const friendsArr =
    Array.isArray(raw?.friends) ? raw.friends :
    Array.isArray(raw?.friendList) ? raw.friendList : [];
  const requestsArr =
    Array.isArray(raw?.friendRequests) ? raw.friendRequests :
    Array.isArray(raw?.friendRequest) ? raw.friendRequest :
    Array.isArray(raw?.requestList) ? raw.requestList : [];

  const toFriend = (f, i) => {
    const serverEmail = f?.email ?? f?.userEmail ?? f?.friendEmail ?? null;
    return {
      id: f?.id ?? f?.userId ?? f?.friendId ?? undefined,
      name: f?.name ?? f?.nickname ?? `Friend ${i}`,
      // keep the *real* email for API calls (may be null)
      email: serverEmail,
      // UI-only text (safe placeholder if missing)
      displayEmail: serverEmail ?? `friend${i}@example.com`,
      profile_image: f?.profile_image ?? f?.profileImage ?? ProfilePic,
      raw: f, // <- keep everything for later disambiguation
    };
  };

  return {
    friends: friendsArr.map(toFriend),
    friendRequests: requestsArr.map(toFriend),
  };
};


const Setting_friends = ({ setView }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // track rows being deleted
  const [removing, setRemoving] = useState(new Set());

  const rowKey = (x, i) => x?.id ?? x?.email ?? i;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const json = await api.getSession("/api/settings/friend");
        const normalized = normalize(json);
        if (!alive) return;
        setFriends(normalized.friends);
        setFriendRequests(normalized.friendRequests);
      } catch (e) {
        console.error("Error fetching friends:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const sameRow = (a, b) => (a.email ?? a.id) === (b.email ?? b.id);

  // ACCEPT request (already working)
  const handleAcceptRequest = async (req) => {
    setFriendRequests(prev => prev.filter(r => !sameRow(r, req)));
    setFriends(prev => [...prev, { ...req, profile_image: req.profile_image ?? ProfilePic }]);

    try {
      await api.postSession("/api/settings/friend/acceptRequest", {
        requestEmail: req.email,
      });
    } catch (e) {
      console.error("Error accepting friend request:", e);
      setFriends(prev => prev.filter(f => !sameRow(f, req)));
      setFriendRequests(prev => [...prev, req]);
      alert("Failed to accept friend request. Please try again.");
    }
  };

  // DECLINE request (already working)
  const handleDeclineRequest = async (req) => {
    setFriendRequests(prev => prev.filter(r => !sameRow(r, req)));
    try {
      await api.deleteSession("/api/settings/friend/rejectRequest", { requestEmail: req.email });
    } catch (e) {
      console.error("Error declining friend request:", e);
      setFriendRequests(prev => [...prev, req]);
      alert("Failed to decline. Please try again.");
    }
  };

  // DELETE friend
  const handleDeleteFriend = async (friend) => {
    const email = friend?.email?.trim?.();
    if (!email) {
      console.warn("Cannot delete: missing real email for", friend);
      alert("이 친구의 이메일 정보가 없어 삭제할 수 없어요. 새로고침 후 다시 시도해 주세요.");
      return;
    }
    const key = rowKey(friend);
    // optimistic remove
    const snapshot = friends;
    setRemoving(prev => new Set(prev).add(key));
    setFriends(prev => prev.filter(f => rowKey(f) !== key));

    try {
      await api.deleteSession("/api/settings/friend/friendDelete", {
        requestEmail: email,
      });
    } catch (e) {
      console.error("Error removing friend:", e);
       console.debug("[DELETE friend] payload ->", { requestEmail: email }, "raw:", friend.raw);
      // rollback
      setFriends(snapshot);
      alert("[DELETE friend] payload ->", { requestEmail: email }, "raw:", friend.raw);
    } finally {
      setRemoving(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const resolveEmailForApi = (f) => {
    const e = f?.email
      ?? f?.raw?.email
      ?? f?.raw?.userEmail
      ?? f?.raw?.friendEmail
      ?? null;
    return typeof e === "string" ? e.trim().toLowerCase() : null;
  };

  return (
    <div className="screen">
      <div className="tab">
        <button onClick={() => setView('profile')}>profile</button>
        <button onClick={() => setView('friends')} disabled>friends</button>
      </div>

      <FriendCard 
      friends={friends} 
      onDelete={handleDeleteFriend} 
      deletingKeys={removing} />


      <div className="LayoutDiv">
        <AddFriendCard />
        <FriendRequestCard
          friendRequests={friendRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />
      </div>
    </div>
  );
};

export default Setting_friends;
