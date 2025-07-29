import { href } from "react-router-dom";
import HomeHeaderBar from "../components/HomeHeaderBar/HomeHeaderBar";
import ScheduledEvents from "../components/ScheduledEvents/ScheduledEvents";
import FreeTimeCalender from "../components/FreeTimeCalendar/FreeTimeCalendar";




const Home = () => {
  return (
    <div className="home-container">
      <HomeHeaderBar />
      <ScheduledEvents />
      <FreeTimeCalender />
    </div>
  );
};

export default Home;