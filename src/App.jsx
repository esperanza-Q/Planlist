import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import ToggleButton from './components/Sidebar/ToggleButton';


import Home from './pages/Home';
import Project from './pages/Project';
import Planlist_Calendar from './pages/Planlsit-Calendar/Planlist_Main';
import Note from './pages/Note';
import AddFreeTimePage from "./pages/AddFreeTimePage";
import Setting from './pages/Setting';
import Setting_friends from './components/Setting/Setting_friends';


function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // 👇 클릭 바깥 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // clean-up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {isSidebarOpen ? (
          <Sidebar ref={sidebarRef} toggleSidebar={toggleSidebar} />
        ) : (
          <ToggleButton onClick={toggleSidebar} />
        )}

        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project" element={<Project />} />
            <Route path="/calendar" element={<Planlist_Calendar />} />
            <Route path="/note" element={<Note />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/add-free-time" element={<AddFreeTimePage/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
