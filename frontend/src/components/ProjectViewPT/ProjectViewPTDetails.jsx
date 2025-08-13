
import MemoCard from "../ProjectView/MemoCard"
import "../ProjectView/ProjectViewDiv.css"
import "./ProjectViewPT.css"

import PTDetailInfoCard from "./PTDetailInfoCard"

import ProfilePic from "../../assets/ProfilePic.png"
import ExerciseCard from "./ExerciseCard"
import CommentCard from "./CommentCard"
import PTGoalCard from "./PTGoalCard"

const exampleComments = [
  { id: 1, profilepic: ProfilePic, user: "trainer1", text: "This is great!", isTrainer: true },
  { id: 2, profilepic: ProfilePic, user: "friend1", text: "I agree with this", isTrainer: false }
];

const sampleProject = {
  
    id: 1,
    title: 'Team Branding Workshop',
    description: "Weekly catch-up and planning meeting.",
    category: 'meeting',
    status: 'Finished',
    repeat:'tuesday',
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

const ProjectViewPTDetails = () => {

    return(
        <div className="screen">
      <div className="project-view-div detail">
      <div className="layout ProjectViewDiv">
        <PTDetailInfoCard project={sampleProject}/>
        <CommentCard initialComments={exampleComments}/>
        
        
      </div>

      <div className="layout ProjectViewDiv">
        <PTGoalCard/>
        <ExerciseCard/>     
        
      </div>
      
      
      
    </div>

    </div>
    )
}

export default ProjectViewPTDetails;