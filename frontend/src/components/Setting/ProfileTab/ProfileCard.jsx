import React, { useEffect, useState } from "react";
import edit_icon from "../../../assets/edit_icon.svg";
import { getProfile, updateProfileMultipart } from "../../../api/profile";
import DefaultProfilePic from "../../../assets/ProfilePic.png";

import { changePassword } from "../../../api/profile";

const ProfileCard = ({ profilePic = "", name: initialName = "", email: initialEmail = "" }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Profile edit states (controlled)
  const [name, setName] = useState(initialName || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [image, setImage] = useState(profilePic || "");
  const [selectedFile, setSelectedFile] = useState(null);

  // Profile edit UI state
  const [savingProfile, setSavingProfile] = useState(false);
  const [okProfile, setOkProfile] = useState("");
  const [errProfile, setErrProfile] = useState("");

  // Password change states (separate form)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [okPwd, setOkPwd] = useState("");
  const [errPwd, setErrPwd] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        const p = data?.profile || data?.user || {};
        setName((p.name ?? initialName ?? "").toString());
        setEmail((p.email ?? initialEmail ?? "").toString());
        setImage(p.profileImage ?? p.profile_image ?? profilePic ?? "");
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setImage(preview); // local preview
    }
  };

  const imgFallback = (e) => {
    e.currentTarget.onerror = null; // prevent loop
    e.currentTarget.src = DefaultProfilePic;
  };

  // --- Profile edit submit (multipart) ---
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setOkProfile("");
    setErrProfile("");

    if (!name.trim()) {
      setErrProfile("Please enter a name.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfileMultipart({ name: name.trim(), file: selectedFile });
      
      setIsEditing(false);

      // Re-fetch to sync with server values
      const data = await getProfile();
      const p = data?.profile || data?.user || {};
      setName((p.name ?? name).toString());
      setEmail((p.email ?? email).toString());
      setImage(p.profileImage ?? p.profile_image ?? image);
      setSelectedFile(null);
    } catch (e2) {
      console.error("updateProfile failed:", e2);
      const msg = (e2?.body && (e2.body.message || e2.body.error)) || e2.message || "Update failed.";
      setErrProfile(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileCancel = async () => {
    setOkProfile("");
    setErrProfile("");
    try {
      const data = await getProfile();
      const p = data?.profile || data?.user || {};
      setName((p.name ?? initialName ?? "").toString());
      setEmail((p.email ?? initialEmail ?? "").toString());
      setImage(p.profileImage ?? p.profile_image ?? profilePic ?? "");
      setSelectedFile(null);
    } catch (e) {
      console.error("Error reloading profile:", e);
    } finally {
      setIsEditing(false);
    }
  };

const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  setOkPwd("");
  setErrPwd("");

  // quick client-side checks (optional)
  if (!oldPassword || !newPassword || !confirmPassword) {
    setErrPwd("Please fill in all password fields.");
    return;
  }
  if (newPassword !== confirmPassword) {
    setErrPwd("New passwords do not match.");
    return;
  }
  if (newPassword.length < 8) {
    setErrPwd("Use at least 8 characters.");
    return;
  }

  try {
    setSavingPwd(true);
    await changePassword({
      currentPassword: oldPassword,
      newPassword,
      confirmPassword,
    });

    setOkPwd("Password changed. Please sign in again.");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // (optional but recommended) log the user out locally so they re-auth
    localStorage.removeItem("accessToken");
    // navigate("/login"); // if you want to redirect
  } catch (e2) {
    console.error("changePassword failed:", e2);
    const msg =
      (e2?.body && (e2.body.message || e2.body.error)) ||
      e2.message ||
      "Failed to change password.";
    setErrPwd(msg);
  } finally {
    setSavingPwd(false);
  }
};
  return (
    <div className="profile-card">
      {/* Global to the card */}
      {okProfile && <div className="profile-ok">{okProfile}</div>}
      {errProfile && <div className="profile-error">{errProfile}</div>}

      {isEditing ? (
        <>
          {/* --- PROFILE EDIT FORM --- */}
          <div className="profile-info-container">
            <label htmlFor="profile-upload">
              <img
                src={image || DefaultProfilePic}
                alt="Profile"
                className="profile-pic"
                style={{ cursor: "pointer" }}
                title="Click to change profile picture"
                onError={imgFallback}
              />
            </label>

            <form className="profile-info" onSubmit={handleProfileSave}>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              <div className="profile-edit">
                <input
                  type="text"
                  value={name ?? ""}
                  onChange={(e) => setName(e.target.value)}
                  className="profile-input"
                />
                <input
                  type="email"
                  value={email ?? ""}
                  disabled
                  className="profile-input"
                />
              </div>

              <div className="profile-button">
                <button className="save-button" type="submit" disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save"}
                </button>
                <button type="button" className="cancel-button" onClick={handleProfileCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* --- PASSWORD FORM (separate) --- */}
          <form className="password-field" onSubmit={handlePasswordSubmit}>
            {okPwd && <div className="profile-ok">{okPwd}</div>}
            {errPwd && <div className="profile-error">{errPwd}</div>}

            <input
              type="password"
              placeholder="type your old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="old-password"
            />
            <input
              type="password"
              placeholder="type your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="new-password"
            />
            <input
              type="password"
              placeholder="confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="new-password-confirm"
            />
            <button className="change-button" type="submit" disabled={savingPwd}>
              {savingPwd ? "Changing..." : "Change Password"}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="profile-info-container">
            <img
              src={image || DefaultProfilePic}
              alt="Profile"
              className="profile-pic"
              onError={imgFallback}
            />
            <div className="profile-info">
              <div className="profile-name">{name}</div>
              <p className="profile-email">{email}</p>
            </div>
          </div>

          <button className="edit-button" onClick={() => setIsEditing(true)}>
            <img src={edit_icon} alt="Edit" />
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileCard;
