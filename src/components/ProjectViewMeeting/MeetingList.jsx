import React from "react";
import { Link } from "react-router-dom";

const MeetingList =({project}) =>{
    return(
        <div className="meeting-list-card">
            <div className="card-title">
                Meetings
            </div>
            <button className="add-meeting">
                add meeting
            </button>
            
            <div className="meeting-list">
                {project.meetings.map((meeting, index) => (
                    <button className="meeting-link">
                    <Link to="details">
                        {meeting}</Link>
                    </button>
                ))}
            </div>

        </div>
    )


}

export default MeetingList;