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

  if (category === "standard") return <StandardPage />;
  if (category === "meeting") return <MeetingPage />;
  if (category === "travel") return <TravelPage />;
  if (category === "pt") return <PTPage />;

  return <div>Please select a valid category.</div>;
};

export default ProjectPage;
