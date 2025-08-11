// src/api/profile.js
import { api } from "./client";

// GET profile
export const getProfile = () => api.get("/api/settings/profile");
export const getFriends = () => api.get("/api/settings/friend");

// PUT profile update (multipart)
export async function updateProfile(file, name) {
  const form = new FormData();
  if (file) form.append('profileImage', file); // MUST match @RequestPart name
  if (typeof name === 'string') form.append('name', name);

  const res = await fetch('/api/settings/profile/updateProfile', {
    method: 'PUT',
    body: form,                 // no Content-Type header; browser sets boundary
    credentials: 'include',     // send session cookie
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  // if backend starts returning updated profile, parse it:
  try { return await res.json(); } catch { return {}; }
}