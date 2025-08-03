import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import ToggleButton from './components/Sidebar/ToggleButton';


import Home from './pages/Home';
import Project from './pages/Project';
import Planlist_Calendar from './pages/Planlsit-Calendar/Planlist_Main';
import Note from './pages/Note';
import AddFreeTimePage from "./pages/AddFreeTimePage";
import Setting from './pages/Setting';

import ProjectCreate from "./components/ProjectCreate/ProjectCreate";

import StandardPage from './pages/CreateCategory/StandardCreatePage';
import MeetingPage from './pages/CreateCategory/MeetingCreatePage';
import TravelPage from './pages/CreateCategory/TravelCreatePage';
import PTPage from './pages/CreateCategory/PTCreatePage';

import ProjectViewMeeting from "./components/ProjectViewMeeting/ProjectViewMeeting"
import ProjectViewMeetingDetails from "./components/ProjectViewMeeting/ProjectViewMeetingDetails"

import ProjectViewStandard from "./components/ProjectViewStandard/ProjectViewStandard"
import NotePage from './pages/Note';
import MemoDetailPage from './pages/MemoDetailPage';
import ProjectPage from "./components/ProjectCreate/ProjectPage";

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from "./pages/LandingPage";


function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // 기본 false (로그인 안 한 상태) 테스트만 true로 쓸 것

  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        {isAuthenticated && (
          isSidebarOpen ? (
            <Sidebar ref={sidebarRef} toggleSidebar={toggleSidebar} />
          ) : (
            <ToggleButton onClick={toggleSidebar} />
          )
        )}

        <main style={{ flex: 1, padding: '20px' }}>
          <Routes>
            {/* 로그인/회원가입 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* 보호된 페이지들 */}
            {isAuthenticated ? (
              <>
                <Route path="/home" element={<Home />} />
                <Route path="/project/list" element={<Project />} />
                <Route path="/calendar" element={<Planlist_Calendar />} />
                <Route path="/note" element={<Note />} />
                <Route path="/setting" element={<Setting />} />
                <Route path="/add-free-time" element={<AddFreeTimePage />} />

                <Route path="/project" element={<ProjectPage />} />
                <Route path="/project/create" element={<ProjectCreate />} />
                <Route path="/project/create/standard" element={<StandardPage />} />
                <Route path="/project/create/meeting" element={<MeetingPage />} />
                <Route path="/project/create/travel" element={<TravelPage />} />
                <Route path="/project/create/pt" element={<PTPage />} />

                <Route path="/memo" element={<NotePage />} />
                <Route path="/memo/:id" element={<MemoDetailPage />} />

                <Route path="/project/meeting" element={<ProjectViewMeeting />} />
                <Route path="/project/meeting/details" element={<ProjectViewMeetingDetails />} />
                <Route path="/project/standard" element={<ProjectViewStandard />} />
              </>
            ) : (
              // 인증 안 된 사용자가 보호된 경로로 접근하면 로그인 페이지로 보냄
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;