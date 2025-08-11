import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import Upcoming_event from "../../../assets/Upcoming_event.svg";
import In_progress_event from "../../../assets/In_progress_event.svg";
import Finished_event from "../../../assets/Finished_event.svg";
import "./ScheduledEvents.css";
import { api } from "../../../api/client";

const ScheduledEvents = () => {
  const [counts, setCounts] = useState({ upcoming: 0, inProgress: 0, finished: 0 });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchHome = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        // 상대경로 → CRA proxy가 8080으로 전달
        const { data } = await api.get("/api/home", {
          signal: controller.signal,
          timeout: 10000,
        });

        // 서버 응답 예) { projectCount: { upcoming, inProgress, finished }, ... }
        const pc = data?.projectCount || {};
        setCounts({
          upcoming: Number(pc.upcoming ?? 0),
          inProgress: Number(pc.inProgress ?? 0),
          finished: Number(pc.finished ?? 0),
        });
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        console.error("Error fetching projectCount:", {
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
        });
        setErrorMsg("일정 요약을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
    return () => controller.abort();
  }, []);

  return (
    <div className="second-section">
      <h2 className="home-section-title">Scheduled Events</h2>

      {loading && <div className="scheduled-events-loading">로딩 중…</div>}
      {errorMsg && <div className="scheduled-events-error">{errorMsg}</div>}

      <div className="scheduled-events">
        <EventCard
          icon={Upcoming_event}
          count={counts.upcoming}
          label="Upcoming Event"
          bgColor="#FFF9F0"
        />
        <EventCard
          icon={In_progress_event}
          count={counts.inProgress}
          label="In-progress Event"
          bgColor="#BAD6EB"
        />
        <EventCard
          icon={Finished_event}
          count={counts.finished}
          label="Finished Event"
          bgColor="#7096D1"
        />
      </div>
    </div>
  );
};

export default ScheduledEvents;
