// src/pages/ProjectPage.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

import StandardPage from '../../pages/CreateCategory/StandardCreatePage';
import MeetingPage from '../../pages/CreateCategory/MeetingCreatePage';
import TravelPage from '../../pages/CreateCategory/TravelCreatePage';
import PTPage from '../../pages/CreateCategory/PTCreatePage';

const ProjectPage = () => {
  const params = new URLSearchParams(useLocation().search);
  const category = params.get("category");

  if (category === "STANDARD") return <StandardPage />;
  if (category === "MEETING") return <MeetingPage />;
  if (category === "Travel") return <TravelPage />;
  if (category === "PT") return <PTPage />;

  return <div>Please select a valid category.</div>;
};

export default ProjectPage;
