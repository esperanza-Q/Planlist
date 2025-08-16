import { href } from "react-router-dom";
import ProjectViewMeeting from "../components/ProjectViewMeeting/ProjectViewMeeting";
import ProjectViewItem from "../components/ProjectView/ProjectViewItem"
import ProjectFilterView from "../components/ProjectView/ProjectFilterView"
import ProfilePic from "../assets/ProfilePic.png"

const allProjects=[
  {
    id: 1,
    title: 'Team Branding Workshop',
    category: 'meeting',
    status: 'Finished',
    startDate: '2025-07-01',
    endDate: '2025-07-07',
    users: [
      { name: 'A', avatar: ProfilePic },
      { name: 'B', avatar: ProfilePic },
      { name: 'C', avatar: ProfilePic },
      { name: 'D', avatar: ProfilePic },
      { name: 'E', avatar: ProfilePic },
      { name: 'F', avatar: ProfilePic },
      { name: 'G', avatar: ProfilePic },
      { name: 'H', avatar: ProfilePic }
    ]
  },
  {
          id: 2,
          title: 'Personal Training session 2',
          category: 'PT',
          status: 'In progress',
          startDate: '2025-08-06',
          endDate: '2025-08-16',
          users: [
            { name: 'A', avatar: ProfilePic },
            { name: 'B', avatar: ProfilePic },
            { name: 'C', avatar: ProfilePic },
            { name: 'D', avatar: ProfilePic }
          ]
    },
     {
          id: 3,
          title: 'Personal Training session ',
          category: 'PT',
          status: 'In progress',
          startDate: '2025-07-25',
          endDate: '2025-07-26',
          users: [
            { name: 'A', avatar: ProfilePic },
            { name: 'B', avatar: ProfilePic },
            { name: 'C', avatar: ProfilePic },
            { name: 'D', avatar: ProfilePic }
          ]
    },
    {
          id: 4,
          title: 'Personal Training session ',
          category: 'standard',
          status: 'Upcoming',
          startDate: '2025-07-26',
          endDate: '2025-07-26',
          users: [
            { name: 'A', avatar: ProfilePic },
            { name: 'B', avatar: ProfilePic },
            { name: 'C', avatar: ProfilePic },
            { name: 'D', avatar: ProfilePic }
          ]
    },
    {
          id: 5,
          title: 'Personal Training session ',
          category: 'PT',
          status: 'Finished',
          startDate: '2025-06-26',
          endDate: '2025-06-26',
          users: [
            { name: 'A', avatar: ProfilePic },
            { name: 'B', avatar: ProfilePic },
            { name: 'C', avatar: ProfilePic },
            { name: 'D', avatar: ProfilePic }
          ]
    },

]

const Project = () => {
  return (
    <div>
      <ProjectFilterView projects={allProjects}/>

    </div>
  );
};

export default Project;