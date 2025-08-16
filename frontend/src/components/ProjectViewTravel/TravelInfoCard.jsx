import edit_icon from "../../assets/edit_icon.svg"
import google_meets from "../../assets/google_meet_logo.svg"
import location_icon from "../../assets/location_icon.svg"
import calendar_icon from "../../assets/calendar_icon.svg"

const TravelInfoCard =({ project }) =>{
    return(
        <div className="info-card">
                    <h2 className="card-title">{project.title}</h2>
                    <p className="project-description">{project.description}</p>
                    <div className="info-container">
                        <img src={calendar_icon} className="icon"/>
                        <div className="info-text">
                            <div className="project-info">
                                {project.endDate === "none"?
                                `${project.startDate} `: 
                                `${project.startDate} ~ ${project.endDate}`}
                                
                            </div>
                            
                            
                        </div>
                    </div>
                    <div className="spacer" style={{height: '15px'}}></div>
                    <div className="info-container">
                        <img src={location_icon} className="icon"/>
                        <div className="info-text">
                            <div className="project-info">
                                {project.placeName === "none"?
                                `none`: 
                                `${project.placeName}`}
        
        
                            </div>
                            
                            <div className="project-subinfo">
                                {project.placeName === "none" ? 
                                ` ` : 
                                `${project.placeAddress}`}
                            </div>
                        </div>
                    </div>
                    
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

export default TravelInfoCard;