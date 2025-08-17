// src/utils/projects.js
export const toUiStatus = (s) => {
  const m = {
    INPROGRESS: "In progress",
    IN_PROGRESS: "In progress",
    UPCOMING: "Upcoming",
    FINISHED: "Finished",
    CONFIRMED: "In progress",
    COMPLETED: "Finished",
    DONE: "Finished",
    PENDING: "Upcoming",
  };
  return m[(s || "").toUpperCase()] || "Unknown";
};

export const toUiCategory = (c) => {
  const v = (c || "").toLowerCase().trim();
  if (v === "pt" || c === "PT") return "PT";
  if (v === "travel") return "travel";
  if (v === "meeting") return "meeting";
  if (v === "standard") return "standard";
  if (v === "project" || v === "default") return "standard";
  return "standard";
};

export const normalizeProjectsFromHome = (raw) => {
  const arr = Array.isArray(raw?.projectOverview) ? raw.projectOverview : [];
  return arr.map((p, i) => ({
    id: p?.projectId ?? p?.id ?? `home-${i}`,
    title: p?.projectTitle ?? p?.title ?? "Untitled Project",
    category: toUiCategory(p?.category),
    status: toUiStatus(p?.status),
    startDate: p?.startDate ?? null,
    endDate: p?.endDate ?? null,
    createdAt: null,
    confirmedAt: null,
    sortStart: p?.startDate ? new Date(p.startDate).getTime() : Number.MAX_SAFE_INTEGER,
    users: [],
    raw: p,
  }));
};
