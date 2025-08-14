// src/components/Setting/ProfileTab/SettingProfile.jsx
import React, { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard.jsx";
import ProjectCard from "./ProjectCard.jsx";
import DefaultProfilePic from "../../../assets/ProfilePic.png";
import "./SettingProfile.css";
import { api } from "../../../api/client";

// Small helper to pick the first non-empty field
const first = (...vals) => vals.find(v => v != null && String(v).trim() !== "") ?? null;

const normalize = (raw) => {
  // Your API returns "profile" (per the sample), not "user"
  const profile = raw?.profile ?? raw?.user ?? {};
  const projectRequest = Array.isArray(raw?.projectRequest) ? raw.projectRequest : [];

  const profilePic =
    first(
      profile?.profile_image,
      profile?.profileImage,
      profile?.avatarUrl
    ) || DefaultProfilePic;

  return {
    user: {
      name: profile?.name ?? "name",
      email: profile?.email ?? "ex@example.com",
      profilePic,
    },
    projectRequests: projectRequest.map((p, i) => ({
      // Your sample uses inviteeId
      invitee_id: p?.inviteeId ?? p?.invitee_id ?? `unknown-${i}`,
      projectTitle: p?.projectTitle ?? "Project title",
      creator: p?.creator ?? "creator",
      // use the user/profile image as the avatar for the request card
      profile_image: profilePic,
    })),
  };
};

const MypageProfile = ({ setView }) => {
  const [profileData, setProfileData] = useState({
    user: { name: "name", email: "ex@example.com", profilePic: DefaultProfilePic },
    projectRequests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const json = await api.getSession("/api/settings/profile");
        const normalized = normalize(json);
        if (alive) setProfileData(normalized);
      } catch (e) {
        console.error("Error fetching profile:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const { user, projectRequests } = profileData;

  return (
    <div className="screen">
      <div className="tab">
        <button onClick={() => setView("profile")} disabled>profile</button>
        <button onClick={() => setView("friends")}>friends</button>
      </div>

      <div className="main-content">
        <ProfileCard
          name={user?.name ?? "name"}
          email={user?.email ?? "ex@example.com"}
          profilePic={user?.profilePic ?? DefaultProfilePic}
        />
        <ProjectCard projectRequests={projectRequests} />
      </div>

      {loading && <div className="profile-loading">Loading…</div>}
    </div>
  );
};

export default MypageProfile;
