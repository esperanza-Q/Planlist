
import MeetingDetailInfoCard from "../../components/ProjectViewMeeting/MeetingDetailInfoCard"
import MeetingList from "../../components/ProjectViewMeeting/MeetingList";
import MemoCard from "../../components/ProjectViewMeeting/MemoCard"
import "./ProjectViewMeeting.css"

import ProfilePic from "../../assets/ProfilePic.png"


const sampleProject = {
  
    id: 1,
    title: 'Team Branding Workshop',
    description: "Weekly catch-up and planning meeting.",
    category: 'meeting',
    status: 'Finished',
    repeat:'none',
    startDate: '2025-07-01',
    startTime: '18:00',
    endTime: '20:00',
    endDate: 'none',
    placeName: 'place',
    placeAddress:'seoul, seongbuk-gu, ...',
    users: [
      { name: 'A', avatar: ProfilePic },
      { name: 'B', avatar: ProfilePic },
      { name: 'C', avatar: ProfilePic },{ name: 'A', avatar: ProfilePic },
      { name: 'B', avatar: ProfilePic },
      { name: 'C', avatar: ProfilePic },{ name: 'A', avatar: ProfilePic },
      { name: 'B', avatar: ProfilePic },
      { name: 'C', avatar: ProfilePic },{ name: 'A', avatar: ProfilePic },
      { name: 'B', avatar: ProfilePic },
      { name: 'C', avatar: ProfilePic },
      
    ],
    meetings: ["meeting1", "meeting2", "meeting3", "meeting4", "meeting5"],
  
};

const exampleMemos = [
  {
    id: "1",
    type: "personal",
    project: "example project 1",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  },
  {
    id: "2",
    type: "group",
    project: "example project 2",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  },
  {
    id: "3",
    type: "personal",
    project: "example project 3",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  },
  {
    id: "4",
    type: "group",
    project: "example project 4",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  },
  {
    id: "5",
    type: "personal",
    project: "example project 5",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  },
  {
    id: "6",
    type: "group",
    project: "example project 6",
    content: "example project description. showing the first few sentences of the memo.",
    category: "meeting"
  }
];

const ProjectViewMeetingDetails = () => {

    return(
        <div className="screen">
      <div className="project-view-meeting detail">
      <div className="layout ProjectViewMeeting">
        <MeetingDetailInfoCard project={sampleProject}/>
        
      </div>
      
      <MemoCard initialMemos={exampleMemos}/>
    </div>

    </div>
    )
}

export default ProjectViewMeetingDetails;