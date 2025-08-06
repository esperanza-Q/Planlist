import { href } from "react-router-dom";
import HomeHeaderBar from "../components/HomeComponents/HomeHeaderBar/HomeHeaderBar";
import ScheduledEvents from "../components/HomeComponents/ScheduledEvents/ScheduledEvents";
import FreeTimeCalender from "../components/HomeComponents/FreeTimeCalendar/FreeTimeCalendar";
import ProjectOverview from "../components/HomeComponents/ProjectOverview/ProjectOverview";
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <HomeHeaderBar />
      <ScheduledEvents />

      <div className="home-bottom-section">
        <FreeTimeCalender />
        <ProjectOverview />
      </div>
    </div>
  );
};

export default Home;
