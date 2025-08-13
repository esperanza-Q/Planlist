import edit_icon from "../../assets/edit_icon.svg"
import google_meets from "../../assets/google_meet_logo.svg"
import calendar_icon from "../../assets/calendar_icon.svg"
import location_icon from "../../assets/location_icon.svg"

const PTInfoCard =({ project }) =>{
    return(
        <div className="info-card">
            <h2 className="card-title">{project.title}</h2>
            <p className="project-description">{project.description}</p>
            
            
            <div className="friends-section">
                
                <div className="friends-small-list">
                {project.users.map((friend, index) => (
                    <div className="friend-small" key={index}>
                    <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="friend-small-avatar"
                    />
                    <span className="friend-small-name">{friend.name}</span>
                    </div>
                ))}
                </div>
            </div>

            <button className="meeting-edit-button" ><img src={edit_icon}/></button>
           
        </div>

    )


}

export default PTInfoCard;