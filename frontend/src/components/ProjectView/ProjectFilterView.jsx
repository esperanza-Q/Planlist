import React, { useState } from 'react';
import ProjectViewItem from './ProjectViewItem';
import { Link, useLocation } from "react-router-dom";
import addIcon from "../../assets/add-icon.svg";

const ProjectFilterView = ({ projects }) => {
  const [filter, setFilter] = useState('all');

  const filteredProjects = projects
    .filter((project) => {
      if (filter === 'all') return true;
      return project.status === filter;
    })
    .sort((a, b) => {
      if (a.status === "Finished" && b.status !== "Finished") return 1;
      if (a.status !== "Finished" && b.status === "Finished") return -1;
      return new Date(a.startDate) - new Date(b.startDate); // fallback: sort by date
    });
  return (
    <div className='homeContainer'>
      {/* Button header */}
      <div className="buttons">
        <button onClick={() => setFilter('all')}>
            
            All</button>
        <button onClick={() => setFilter('In progress')}>
            <div className="circle red"></div>
            In progress
            </button>
        <button onClick={() => setFilter('Upcoming')}>
          <div className="circle green"></div>
          Upcoming
        </button>
        <button onClick={() => setFilter('Finished')}>
            <div className="circle"></div>
            Finished
            </button>
        
        
        <div className='addProject'>
            <img src={addIcon}/>
            <Link to="/project/create">Create project</Link>
        </div>
        
      </div>

      {/* Project List */}
      <div className="project-list">
        {filteredProjects.map((project) => (
          <ProjectViewItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectFilterView;