import React, { useRef, useState } from 'react';
import './ProjectOverview.css';

import Overview_Cat_Big from '../../../assets/Overview_Cat_Big.svg';
import Overview_Cat01 from '../../../assets/Overview_Cat01.svg';
import Overview_Cat02 from '../../../assets/Overview_Cat02.svg';
import Overview_Cat03 from '../../../assets/Overview_Cat03.svg';
import Overview_Cat04 from '../../../assets/Overview_Cat04.svg';

const mockProjects = [
  {
    id: 1,
    name: 'Coding Bootcamp',
    description: 'html and css',
    date: '08/22~08/24',
    type: 'meeting',
    image: Overview_Cat01,
  },
  {
    id: 2,
    name: 'Meeting with client',
    description: 'client meeting',
    date: '07/16',
    type: 'meeting',
    image: Overview_Cat02,
  },
  {
    id: 3,
    name: 'Meeting with team',
    description: 'online meeting',
    date: '08/23',
    type: 'meeting',
    image: Overview_Cat03,
  },
  {
    id: 4,
    name: 'Project planning',
    description: ' ',
    date: '08/12~08/14',
    type: 'meeting',
    image: Overview_Cat04,
  },

  {
    id: 5,
    name: 'Pilates Training',
    description: 'weekly sessions',
    date: '07/12~07/14',
    type: 'meeting',
    image: Overview_Cat04,
  },

  {
    id: 6,
    name: 'Travel to Paris',
    description: 'planned trip',
    date: '12/13~12/17',
    type: 'meeting',
    image: Overview_Cat04,
  },
  
];

const ProjectOverview = () => {
  const circleRef = useRef(null);
  const [angle, setAngle] = useState(0);

  const handleScroll = (e) => {
    const delta = e.deltaY;
    setAngle(prev => prev + delta * 0.3); 
  };

  return (
    <div className="project-overview">
      <h2 className="overview-title">Project Overview</h2>
      <div className="overview-card" onWheel={handleScroll}>
        <div className="overview-leftside-cat">
          <img src={Overview_Cat_Big} alt="cat" className="half-cat-image" />
        </div>
        <div className="overview-right">
          <div className="circle-orbit" ref={circleRef}>
            {mockProjects.map((project, index) => {
              const deg = angle + (360 / mockProjects.length) * index;
              const x = 500 * Math.cos((deg * Math.PI) / 180);
              const y = 225 * Math.sin((deg * Math.PI) / 180);
              return (
                <div
                  key={project.id}
                  className="project-item-circle"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    position: 'absolute',
                    top: '40%',
                    left: '-47%',
                  }}
                >
                  <img src={project.image} alt="icon" className="project-icon" />
                  <div className="project-info">
                    <p className="project-title">{project.name}</p>
                    <p className="project-desc">{project.description}</p>
                  </div>
                  <div className="project-meta">
                    <p className="project-date">{project.date}</p>
                    <p className="project-type">{project.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
