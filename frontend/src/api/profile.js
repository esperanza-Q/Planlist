// src/api/profile.js
import { api } from "./client";

export const getProfile = () => api.getSession("/api/settings/profile");

export const updateProfileMultipart = ({ name, file }) => {
  const fd = new FormData();
  if (name != null) fd.append("name", name);
  if (file) fd.append("profileImage", file);
  return api.putSession("/api/settings/profile/updateProfile", fd);
};

export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  // /api/settings/profile/changePassword
  return api.postSession("/api/settings/profile/changePassword", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
}