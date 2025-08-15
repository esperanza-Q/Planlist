import ViewPlannerCard from "./ViewPlannerCard";
import "./ProjectViewTravel.css"
import TravelInfoCard from "./TravelInfoCard";
import ProfilePic from "../../assets/ProfilePic.png"
import TravelMemoCard from "./TravelMemoCard";

const exampleTrip = {
  "project_id": 42,
  "project_name": "Summer Trip to California",
  "description": "simple information about the project",
  "start_date": "2025-08-20T08:00:00",
  "end_date": "2025-08-23T22:00:00",
  "location": "Seoul",

  "creator": {
    "id": 7,
    "username": "haemin"
  },

  "participants": [
    { "id": 7, "username": "haemin" },
    { "id": 8, "username": "friend 1" },
    { "id": 9, "username": "friend 2" },
    { "id": 10, "username": "friend 3" }
  ],

  "datePlanners": [
    {
      "date": "2025-08-22",
      "schedules": [
        {
          "placeName": "광화문 광장",
          "category": "place",
          "address": "서울 종로구 세종대로 172",
          "description": "서울 중심의 역사적 장소",
          "startTime": "10:00"
        },
        {
          "placeName": "을지로 골뱅이",
          "category": "restaurant",
          "address": "서울 중구 을지로3가",
          "description": "을지로 대표 골뱅이 맛집",
          "startTime": "13:30"
        },
        {
          "placeName": "을지로 골뱅이",
          "category": "restaurant",
          "address": "서울 중구 을지로3가",
          "description": "을지로 대표 골뱅이 맛집",
          "startTime": "13:30"
        },
        {
          "placeName": "을지로 골뱅이",
          "category": "restaurant",
          "address": "서울 중구 을지로3가",
          "description": "을지로 대표 골뱅이 맛집",
          "startTime": "13:30"
        },
        {
          "placeName": "을지로 골뱅이",
          "category": "restaurant",
          "address": "서울 중구 을지로3가",
          "description": "을지로 대표 골뱅이 맛집",
          "startTime": "13:30"
        }
      ],
      "moves": [
        {
          "transportation": "지하철",
          "duration_min": 20
        },
        {
          "transportation": "지하철",
          "duration_min": 20
        },
        {
          "transportation": "버스",
          "duration_min": 20
        },
        {
          "transportation": "지하철",
          "duration_min": 20
        },
        {
          "transportation": "지하철",
          "duration_min": 20
        }
      ]
    },
    {
      "date": "2025-08-23",
      "schedules": [
        {
          "placeName": "국립현대미술관",
          "category": "place",
          "address": "서울 종로구 삼청로 30",
          "description": "현대미술 전시가 진행되는 국립 미술관",
          "startTime": "09:00"
        },
        {
          "placeName": "백리향 호텔",
          "category": "accomodation",
          "address": "서울 중구 퇴계로 67",
          "description": "럭셔리 중식당과 연결된 숙소",
          "startTime": "18:00"
        }
      ],
      "moves": [
        {
          "transportation": "버스",
          "duration_min": 15
        },
        {
          "transportation": "도보",
          "duration_min": 8
        }
      ]
    },
    {
      "date": "2025-08-24",
      "schedules": [
        {
          "placeName": "청계천 산책로",
          "category": "place",
          "address": "서울 종로구 청계천로",
          "description": "도심 속 걷기 좋은 산책로",
          "startTime": "11:00"
        },
        {
          "placeName": "성수동 맛집거리",
          "category": "restaurant",
          "address": "서울 성동구 성수이로",
          "description": "핫한 맛집과 디저트 숍이 모여있는 거리",
          "startTime": "14:00"
        }
      ],
      "moves": []
    }
  ],

  "teamMemo": {
    "content": "전체 일정을 무리 없이 소화하도록 여유 시간을 충분히 확보할 것!"
  }
};

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
    endDate: '2025-07-04',
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

const ProjectViewTravel = () =>{
    return(
        <div className="screen">
            <div className="project-view-div">
                <div className="layout">
                                    <TravelInfoCard project={sampleProject}/>
                <TravelMemoCard initialMemos={exampleMemos}/>

                </div>
                <ViewPlannerCard project={exampleTrip}/>

            </div>
            
        </div>
    )
}

export default ProjectViewTravel;