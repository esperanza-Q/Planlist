import React, { useEffect, useState } from "react";
import edit_icon from "../../../assets/edit_icon.svg";
import { getProfile, updateProfile } from "../../../api/profile";
import DefaultProfilePic from "../../../assets/ProfilePic.png"


const ProfileCard = ({ profilePic: initialProfilePic="", name: initialName = "", email: initialEmail = "" }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Values shown in the UI
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [image, setImage] = useState(initialProfilePic);

  // For image upload + preview
  const [selectedFile, setSelectedFile] = useState(null);

  // Password fields (local-only for now)
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif'];
  const MAX_MB = 5;

  const bust = (url) => url ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url;


  const normalize = (v) => (typeof v === 'string' ? v.trim() : '');
  const toImgSrc = (val) => {
    const s = normalize(val);
    return s ? s : null;
  };

  // Load profile from backend once
  useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        console.log("Profile API Response:", data); //  see backend data in console


        const p = data?.profile || {};
        setName(p.name ?? initialName);
        setEmail(p.email ?? initialEmail);
        setImage(p.profileImage ?? initialProfilePic);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    })();
 
  }, []); // run once on mount

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Image must be ≤ ${MAX_MB} MB.`);
      return;
    }

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setImage(preview);

    // optional: revoke old blob when a new one is set
    // (safe enough to skip; add if you frequently change images)
  };



    const handleSave = async () => {
      try {
        setSaving(true);
        await updateProfile(selectedFile, name.trim());

        // Re-fetch to get the real S3/Google URL from the server
        const fresh = await getProfile();
        const p = fresh?.profile || {};
        // cache-bust if the same URL key is reused
        const nextImg = p.profileImage ? `${p.profileImage}${p.profileImage.includes('?') ? '&' : '?'}t=${Date.now()}` : null;

        setName(p.name ?? name);
        setEmail(p.email ?? email);
        setImage(nextImg);

        setSelectedFile(null);
        setIsEditing(false);
      } catch (err) {
        console.error('Error updating profile:', err);
        alert('Failed to update profile.');
      } finally {
        setSaving(false);
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
        setImage(p.profileImage ?? initialProfilePic);
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
                  src={normalize(image) || DefaultProfilePic}
                  alt="Profile"
                  className="profile-pic"
                  referrerPolicy="no-referrer"
                  onError={(e) => { console.warn('img error', image); e.currentTarget.src = DefaultProfilePic; }}
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '50%' }}
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
                <button className="save-button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
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
              <img
                src={normalize(image) || DefaultProfilePic}
                alt="Profile"
                className="profile-pic"
                referrerPolicy="no-referrer"
                onError={(e) => { console.warn('img error', image); e.currentTarget.src = DefaultProfilePic; }}
                style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '50%' }}
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
    </div>
  );
};

export default ProfileCard;
