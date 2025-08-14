// src/components/HomeComponents/ScheduledEvents/ScheduledEvents.jsx
import React, { useEffect, useState } from "react";
import EventCard from "./EventCard";
import Upcoming_event from '../../../assets/Upcoming_event.svg';
import In_progress_event from '../../../assets/In_progress_event.svg';
import Finished_event from '../../../assets/Finished_event.svg';
import "./ScheduledEvents.css";
import {api} from "../../../api/client"; // example path

const ScheduledEvents = () => {
  // 1) 초기값에 안전한 기본 구조를 넣어 첫 렌더에서 터지지 않게
  const [eventData, setEventData] = useState({
    projectCount: { upcoming: 0, inProgress: 0, finished: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const json = await api.getSession("/api/home");

        // 3) 응답 정규화: projectCount가 없으면 기본값으로
        const normalized = {
          projectCount: {
            upcoming: Number(json?.projectCount?.upcoming ?? 0),
            inProgress: Number(json?.projectCount?.inProgress ?? 0),
            finished: Number(json?.projectCount?.finished ?? 0),
          },
        };

        if (alive) setEventData(normalized);
      } catch (e) {
        console.error("Error fetching projectCount:", e);
        if (alive) {
          setEventData({ projectCount: { upcoming: 0, inProgress: 0, finished: 0 } });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const upcoming = eventData?.projectCount?.upcoming ?? 0;
  const inProgress = eventData?.projectCount?.inProgress ?? 0;
  const finished = eventData?.projectCount?.finished ?? 0;

  return (
    <div className="second-section">
      <h2 className="home-section-title">Scheduled Events</h2>
      <div className="scheduled-events">
        <EventCard
          icon={Upcoming_event}
          count={upcoming}
          label="Upcoming Event"
          bgColor="#FFF9F0"
        />
        <EventCard
          icon={In_progress_event}
          count={inProgress}
          label="In-progress Event"
          bgColor="#BAD6EB"
        />
        <EventCard
          icon={Finished_event}
          count={finished}
          label="Finished Event"
          bgColor="#7096D1"
        />
      </div>
      {loading && <div className="scheduled-events-loading">Loading…</div>}
    </div>
  );
};

export default ScheduledEvents;

