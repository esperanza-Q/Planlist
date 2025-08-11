// src/api/profile.js
import { api } from "./client";

// GET profile
export const getProfile = () => api.get("/api/settings/profile");

// PUT profile update (multipart)
export const updateProfile = (file, name) => {
  const fd = new FormData();
  if (file) fd.append("profileImage", file); // matches @RequestPart("profileImage")
  if (name) fd.append("name", name);
  return api.put("/api/settings/profile/updateProfile", fd);
};
