import React, { forwardRef } from 'react';
import './Sidebar.css';
import planlist_logo from '../../assets/planlist_logo.svg';
import SidebarItem from './SidebarItem';
import NextEventCard from './NextEventCard';
import { useLocation } from 'react-router-dom'; 

import HomeIcon from '../../icons/HomeIcon';
import FolderOpenIcon from '../../icons/FolderOpenIcon';
import CalendarCheckIcon from '../../icons/CalenderCheckIcon';
import NoteIcon from '../../icons/NoteIcon';
import UserCircleIcon from '../../icons/UserCircleIcon';
import CubeAltIcon from '../../icons/CubeAltIcon';
import DiscussionIcon from '../../icons/DiscussionIcon';
import DumbbellAltIcon from '../../icons/DumbbellAltIcon';
import PlaneIcon from '../../icons/PlaneIcon';



const viewOptions = [
  { label: 'Standard', icon: <CubeAltIcon />, path: '/standard' },
  { label: 'Meeting', icon: <DiscussionIcon />, path: '/meeting' },
  { label: 'PT', icon: <DumbbellAltIcon />, path: '/pt' },
  { label: 'Travel', icon: <PlaneIcon />, path: '/travel' },
];

const Sidebar = forwardRef(({ isOpen }, ref) => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedCategory = params.get('category'); 
    const isAnyCategoryActive = viewOptions.some(
    ({ label }) =>
      selectedCategory &&
      selectedCategory.toLowerCase() === label.toLowerCase()
  );
    return (
    <div ref={ref} className={`sidebar ${isOpen ? "open" : ""}`}>
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src={planlist_logo} alt="Planlist Logo" className="sidebar-logo" />

        <nav className="sidebar-menu">
            <SidebarItem label="Home" to="/home" icon={<HomeIcon />} />
            <SidebarItem label="Project" to="/project/list" icon={<FolderOpenIcon />} />
            <SidebarItem label="Planlist Calendar" to="/calendar" icon={<CalendarCheckIcon />} />
            <SidebarItem label="Note" to="/note" icon={<NoteIcon />} />
            <SidebarItem label="Setting" to="/setting" icon={<UserCircleIcon/>} />
        </nav>

        <div className="sidebar-section">
          <p className={`section-title ${isAnyCategoryActive ? 'active-view' : ''}`}>
            Current View
          </p>
          <div className="view-buttons">
            {viewOptions.map(({ label, icon }) => {
              const isActive =
                selectedCategory &&
                selectedCategory.toLowerCase() === label.toLowerCase();

                return (
                  
                    <button
                      key={label}
                      className={`view-button ${isActive ? 'active-view' : ''}`} // 나중에 project와 연결 필요
                      disabled
                    >
                      <div className="view-icon">{icon}</div>
                      <span>{label}</span>
                    </button>
                );
            })}
            </div>
        </div>
        <NextEventCard />
      </div>
    </aside>
    </div>
  );
});



export default Sidebar;
