import React, { useState } from "react";
import edit_icon from "../../../assets/edit_icon.svg"

const ProfileCard = ({ profilePic, name: initialName, email: initialEmail }) =>{
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);

    const [image, setImage] = useState(profilePic);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setImage(imageUrl);
        }
    };
    
    const handleSave = () => {
        setIsEditing(false);
        //saving code needed
        alert("Profile updated!");
    };

    const handleCancel = () => {
        setName(initialName);
        setEmail(initialEmail);
        setIsEditing(false);
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
        alert("Password changed!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return(
    <div className="profile-card">
            
        {isEditing ? (
            <>
                <label htmlFor="profile-upload">
                    <img
                        src={image}
                        alt="Profile"
                        className="profile-pic"
                        style={{ cursor: "pointer" }}
                        title="Click to change profile picture"
                    />
                </label>
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="profile-input"
                    />
                </div>
                <div className="profile-button">
                    <button className="save-button" onClick={handleSave}>Save</button>
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>


                </div>
                                
            </>
        ) : (
        <>
            <img src={image} alt="Profile" className="profile-pic" />

            <div className="profile-name">{name}</div>
            <p className="profile-email">{email}</p>
            <button className="edit-button" onClick={() => setIsEditing(true)}><img src={edit_icon}/></button>
        </>
        )}
      

    <div className="password-field">
        <div className="password-label">old password</div>
        <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
        />
        <div className="password-label">new password</div>
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
    </div>
    
    
    <button className="change-button" onClick={handleChangePassword}>
        Change Password
    </button>
      
    </div>

    ) 
}

export default ProfileCard;