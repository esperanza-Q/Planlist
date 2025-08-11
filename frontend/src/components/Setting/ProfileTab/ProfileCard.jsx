import React, { useEffect, useState } from "react";
import edit_icon from "../../../assets/edit_icon.svg";
import { getProfile, updateProfile } from "../../../api/profile";

const ProfileCard = ({ profilePic = "", name: initialName = "", email: initialEmail = "" }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Values shown in the UI
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(profilePic);

  // For image upload + preview
  const [selectedFile, setSelectedFile] = useState(null);

  // Password fields (local-only for now)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile from backend once
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        console.log("Profile API Response:", data); // 👈 see backend data in console

        // Your service returns ProjectRequestWrapperDTO:
        // { profile: { name, email, profileImage }, projectRequest: [...] }
        const p = data?.profile || {};
        setName(p.name ?? initialName);
        setEmail(p.email ?? initialEmail);
        setImage(p.profileImage ?? profilePic);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // keep the actual file for upload
      const preview = URL.createObjectURL(file);
      setImage(preview); // preview in UI
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(selectedFile, name); // your api expects (file, name)
      console.log("Update Profile: sent", { hasFile: !!selectedFile, name });
      alert("Profile updated!");
      setIsEditing(false);
      // (optional) re-fetch profile here if you want to refresh from server
      // const data = await getProfile(); ...
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    // Revert to last loaded values by re-fetching
    (async () => {
      try {
        const data = await getProfile();
        const p = data?.profile || {};
        setName(p.name ?? initialName);
        setEmail(p.email ?? initialEmail);
        setImage(p.profileImage ?? profilePic);
        setSelectedFile(null);
      } catch (err) {
        console.error("Error reloading profile:", err);
      } finally {
        setIsEditing(false);
      }
    })();
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    // TODO: call your password API when ready
    alert("Password changed!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="profile-card">
      <div>
        {isEditing ? (
          <>
            <div className="profile-info-container">
              <label htmlFor="profile-upload">
                <img
                  src={image}
                  alt="Profile"
                  className="profile-pic"
                  style={{ cursor: "pointer" }}
                  title="Click to change profile picture"
                />
              </label>

              <div className="profile-info">
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-input"
                  />
                  <input
                    type="email"
                    value={email}
                    disabled // usually email is not editable
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-button">
                <button className="save-button" onClick={handleSave}>Save</button>
                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              </div>
            </div>

            <div className="password-field">
              <div className="password-label">Old password</div>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <div className="password-label">New password</div>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button className="change-button" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="profile-info-container">
              <img src={image} alt="Profile" className="profile-pic" />
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
    </div>
  );
};

export default ProfileCard;
