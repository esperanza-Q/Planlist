import React, { useState } from "react";
import arrow_long from "../../assets/arrow_long.svg"
import location_icon from "../../assets/location_icon_selected.svg"
import bus from "../../assets/bus.svg"

const ViewPlannerCard = ({ project }) => {
    const [selectedDate, setSelectedDate] = useState(() => {
        return project?.datePlanners?.[0]?.date || "";
    });


    const currentPlanner = project.datePlanners.find(dp => dp.date === selectedDate);
    const timeline = [];

    if (currentPlanner) {
        for (let i = 0; i < currentPlanner.schedules.length; i++) {
        timeline.push({ ...currentPlanner.schedules[i], type: "schedule" });
        if (currentPlanner.moves[i]) {
            timeline.push({ ...currentPlanner.moves[i], type: "move" });
        }
        }
    }

    return (
        <div className="view-planner">
            <div className="card-title"> Planner</div>
            <div className="tab planner-tab">
                {project.datePlanners.map((dp) => (
                <button
                    key={dp.date}
                    onClick={() => setSelectedDate(dp.date)}
                    disabled={selectedDate === dp.date}
                    className={selectedDate === dp.date ? "active" : ""}
                >
                    {dp.date}
                </button>
                ))}
            </div>

            <div className="planner-day-content">
                {timeline.map((item, idx) =>
                item.type === "schedule" ? (
                    <div className="schedule-item" key={idx}>
                        <img className="schedule-icon" src={location_icon}/>
                        <div className="schedule-text">
                            <strong>{item.placeName}</strong> 
                            <div className="schedule-view-time">{item.startTime}</div><br />
                            <span>{item.address}</span><br />
                            <p>{item.description}</p>
                        </div>
                        
                    </div>
                ) : (
                    <div className="move-item" key={idx} >
                        <img className="arrow" src ={arrow_long}/>
                        <img className="buts" src={bus}/>
                        <p>{item.transportation} – {item.duration_min} min</p>
                    </div>
                )
                )}
            </div>
        </div>
  );
};

export default ViewPlannerCard;
