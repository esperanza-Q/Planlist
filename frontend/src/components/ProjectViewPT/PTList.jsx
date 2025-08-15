
import { Link } from "react-router-dom";

const PTList =({project}) =>{
    return(
        <div className="session-list-card">
            <div className="card-title">
                PT sessions
            </div>
            <button className="add-session">
                add session
            </button>
            
            <div className="session-list">
                {project.sessions.map((session, index) => (
                    <Link to="details">
                    <button className="session-link">
                    
                        {session}
                    </button>
                    </Link>
                ))}
            </div>

        </div>
    )


}

export default PTList;