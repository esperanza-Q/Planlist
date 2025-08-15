import MemoCard from "../ProjectView/MemoCard";
import PTList from "./PTList";
import PTInfoCard from "./PTInfoCard"
import ProfilePic from "../../assets/ProfilePic.png"
import "../ProjectView/ProjectViewDiv.css"


const sampleProject = {
  
    id: 1,
    title: 'Team Branding Workshop',
    description: "Weekly catch-up and planning meeting.",
    category: 'meeting',
    status: 'Finished',
    repeat:'tuesday',
    startDate: '2025-07-01',
    endDate: '2025-07-07',
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
    sessions: ["Pt1", "Pt2", "Pt3", "Pt4"],
  
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

const ProjectViewPT = () => {
    return (
        <div className="screen">
            <div className="project-view-div">
                <div className="layout ProjectView">
                    <PTInfoCard project={sampleProject}/>
                    <PTList project={sampleProject}/>
                </div>
                <MemoCard initialMemos={exampleMemos}/>

            </div>
        </div>
    )

}

export default ProjectViewPT;