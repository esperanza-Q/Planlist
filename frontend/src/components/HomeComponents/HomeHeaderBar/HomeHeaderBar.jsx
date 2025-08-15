import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomeHeaderBar.css";
import PlusIcon from "../../../icons/PlusIcon";

const HeaderBar = () => {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Seoul",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      timeZone: "Asia/Seoul",
    });
  };

  const handleAddFreeTime = () => {
    navigate("/add-free-time");
  };

  return (
    <div className="header-bar">
      <div className="date-time-group">
        <div className="date-box">{formatDate(time)}</div>
        <div className="time-box">
          <span className="red-dot" />
          {formatTime(time)} KST
        </div>
      </div>

      <button className="add-btn" onClick={handleAddFreeTime}>
        <PlusIcon/> Add Free Time
      </button>
    </div>
  );
};

export default HeaderBar;
