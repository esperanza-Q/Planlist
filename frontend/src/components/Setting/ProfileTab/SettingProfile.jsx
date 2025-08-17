// src/components/Setting/ProfileTab/SettingProfile.jsx
import React, { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard.jsx";
import ProjectCard from "./ProjectCard.jsx";
import DefaultProfilePic from "../../../assets/ProfilePic.png";
import "./SettingProfile.css";
import { api } from "../../../api/client";

// pick the first non-empty value
const first = (...vals) =>
  vals.find((v) => v != null && String(v).trim() !== "") ?? null;

// ultra-resilient normalizer
const normalize = (raw) => {
  const root = raw?.data ?? raw ?? {};

  // "user" per spec; some older payloads had "profile"
  const userOrProfile = root.user ?? root.profile ?? {};

  // requests might be "projectRequest" (list) or "projectRequests"
  const reqs = Array.isArray(root.projectRequest)
    ? root.projectRequest
    : Array.isArray(root.projectRequests)
    ? root.projectRequests
    : [];

  const profilePic =
    first(
      userOrProfile.profile_image,
      userOrProfile.profileImage,
      userOrProfile.avatarUrl
    ) || DefaultProfilePic;

  const user = {
    name:
      first(
        userOrProfile.name,
        userOrProfile.username,
        userOrProfile.displayName
      ) ?? "name",
    email:
      first(userOrProfile.email, userOrProfile.mail, userOrProfile.userEmail) ??
      "ex@example.com",
    profilePic,
  };

  const projectRequests = reqs.map((p, i) => {
    const projectTitle =
      first(
        p?.projectTitle,
        p?.project_title,
        p?.title,
        p?.project?.title,
        p?.project?.name,
        p?.project?.projectTitle,
        p?.projectName
      ) ?? "Project title";

    const creator =
      first(
        p?.creator,
        p?.creatorName,
        p?.creator_name,
        p?.owner,
        p?.ownerName,
        p?.createdBy,
        p?.createdByName,
        p?.creatorEmail,
        p?.project?.creator,
        p?.project?.creatorName,
        p?.project?.ownerName,
        p?.project?.owner?.name,
        p?.project?.creator?.name
      ) ?? "creator";

    return {
      invitee_id: p?.invitee_id ?? p?.inviteeId ?? `unknown-${i}`,
      projectTitle,
      creator,
      profile_image: p?.creatorProfileImage// reuse user's pic for now
    };
  });

  return { user, projectRequests };
};

const DEFAULT_STATE = {
  user: { name: "name", email: "ex@example.com", profilePic: DefaultProfilePic },
  projectRequests: [],
};

const MypageProfile = ({ setView }) => {
  const [profileData, setProfileData] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const json = await api.getSession("/api/settings/profile");
        console.log("[/api/settings/profile] raw:", json);
        const normalized = normalize(json);
        console.log("[/api/settings/profile] normalized:", normalized);
        if (alive) setProfileData(normalized ?? DEFAULT_STATE);
      } catch (e) {
        console.error("Error fetching profile:", e);
        if (alive) setProfileData(DEFAULT_STATE);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const { user, projectRequests } = profileData ?? DEFAULT_STATE;

  return (
    <div className="screen">
      <div className="tab">
        <button onClick={() => setView("profile")} disabled>
          profile
        </button>
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
