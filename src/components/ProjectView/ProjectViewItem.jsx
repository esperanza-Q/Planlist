import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectView.css";
import ProfileOverflow from '../../assets/profile_overflow.svg';

const ProjectViewItem = ({project}) => {
    const navigate = useNavigate();
    const handleClick = () => {
      let path = "/project/";
      switch (project.category) {
        case "standard":
          path += "standard";
          break;
        case "PT":
          path += "pt";
          break;
        case "travel":
          path += "travel";
          break;
        case "meeting":
          path += "meeting";
          break;
        default:
          path += "standard";
      }

      navigate(`${path}/${project.id}`);
    };
      
    return(
        <div className="ItemDiv" onClick={handleClick}>
            
          <div className="title">{project.title}</div>
            
            
          <div className="project-status-indicator">
            <span className={`status-circle ${project.status.replace(" ", "-")}`} title={project.status}></span>
            <span className={`status-label ${project.status.replace(" ", "-")}`}>{project.status}</span>
          </div>
            

          <div className="userContainer">
            <div className="user">
              {project.users && project.users.slice(0, 6).map((user, index) => {
                
                const isLastVisible = index === 5 && project.users.length > 5;
                return isLastVisible ? (
                  <img
                    key="overflow"
                    src={ProfileOverflow}
                    alt="More users"
                    className="user-avatar"
                    title="More users"
                  />
                ) : (
                  <img
                    key={index}
                    src={user.avatar}
                    alt={user.name}
                    className="user-avatar"
                    title={user.name}
                  />
                );
              })}
            </div>
          </div>
          <div className="category">{project.category}</div>
          <div className="dates">
          {project.startDate} ~ {project.endDate}
          </div>

        </div>

    );



}

export default ProjectViewItem;

