
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
                    <Link to="details">
                    <button className="meeting-link">
                    
                        {meeting}
                    </button>
                    </Link>
                ))}
            </div>

        </div>
    )


}

export default MeetingList;