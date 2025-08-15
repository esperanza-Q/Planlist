// src/components/Travel/ProjectViewTravel.jsx
import ViewPlannerCard from "./ViewPlannerCard";
import "./ProjectViewTravel.css";
import TravelInfoCard from "./TravelInfoCard";
import ProfilePic from "../../assets/ProfilePic.png";
import TravelMemoCard from "./TravelMemoCard";

// ---------- your trip mock ----------
const exampleTrip = {
  "project_id": 99,
  "project_name": "Seoul 2-Day Cultural Trip",
  "description": "Exploring iconic Seoul landmarks and enjoying a comfortable stay.",
  "start_date": "2025-08-27T09:00:00",
  "end_date": "2025-08-28T20:00:00",
  "location": "Seoul",

  "creator": { "id": 7, "username": "haemin" },
  "participants": [
    { "id": 7, "username": "alice" },
    { "id": 8, "username": "bob" },
    { "id": 9, "username": "michael" }
  ],

  "datePlanners": [
    {
      "date": "2025-08-27",
      "schedules": [
        { "placeName": "Namsan Tower", "category": "place", "address": "Seoul, Yongsan-gu", "description": "Famous tower offering panoramic views of Seoul.", "startTime": "10:00" },
        { "placeName": "Lotte Hotel", "category": "accomodation", "address": "Seoul, Jung-gu", "description": "Luxury hotel in the heart of Seoul.", "startTime": "18:00" }
      ],
      "moves": [
        { "transportation": "지하철", "duration_min": 25 },
        { "transportation": "도보", "duration_min": 10 }
      ]
    },
    {
      "date": "2025-08-28",
      "schedules": [
        { "placeName": "Seoul Forest", "category": "place", "address": "Seoul, Seongdong-gu", "description": "Large eco park with walking paths and deer enclosure.", "startTime": "09:30" },
        { "placeName": "Gyeongbokgung Palace", "category": "place", "address": "Seoul, Jongno-gu", "description": "Historic palace of the Joseon dynasty.", "startTime": "13:30" }
      ],
      "moves": [
        { "transportation": "버스", "duration_min": 20 },
        { "transportation": "도보", "duration_min": 15 }
      ]
    }
  ],

  "teamMemo": { "content": "Make sure to book palace tickets online to avoid queues." }
};

// ---------- helpers: format + normalize ----------
const toDate = (iso) => {
  if (!iso) return "TBD";
  // "YYYY-MM-DDTHH:mm:ss" -> "YYYY-MM-DD"
  return iso.slice(0, 10);
};
const toTime = (iso) => {
  if (!iso) return "TBD";
  // "YYYY-MM-DDTHH:mm:ss" -> "HH:mm"
  const t = iso.split("T")[1] || "";
  return t.slice(0, 5) || "TBD";
};

// Map exampleTrip -> shape for TravelInfoCard
const tripToInfoProject = (trip) => ({
  id: trip.project_id,
  title: trip.project_name,
  description: trip.description,
  category: "travel",
  status: "Active",
  repeat: "none",
  startDate: toDate(trip.start_date),
  startTime: toTime(trip.start_date),
  endTime: toTime(trip.end_date),
  endDate: toDate(trip.end_date),
  placeName: trip.location || "",
  placeAddress: trip.location || "",
  users: Array.isArray(trip.participants)
    ? trip.participants.map((p) => ({
        name: p.username,
        avatar: ProfilePic, // fallback; replace with real avatars when available
      }))
    : [],
  meetings: []
});

// ---------- sample memos (unchanged) ----------
const exampleMemos = [
  { id: "1", type: "personal", project: "example project 1", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "2", type: "group", project: "example project 2", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "3", type: "personal", project: "example project 3", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "4", type: "group", project: "example project 4", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "5", type: "personal", project: "example project 5", content: "example project description. showing the first few sentences of the memo.", category: "meeting" },
  { id: "6", type: "group", project: "example project 6", content: "example project description. showing the first few sentences of the memo.", category: "meeting" }
];

// ---------- component ----------
const ProjectViewTravel = () => {
  const infoProject = tripToInfoProject(exampleTrip);

  return (
    <div className="screen">
      <div className="project-view-div">
        <div className="layout">
          {/* Use the mapped project for your info card */}
          <TravelInfoCard project={infoProject} />

          {/* Memos as before */}
          <TravelMemoCard initialMemos={exampleMemos} />
        </div>

        {/* Pass the FULL trip object to the planner view */}
        <ViewPlannerCard project={exampleTrip} />
      </div>
    </div>
  );
};

export default ProjectViewTravel;
