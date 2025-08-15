import React, { useState } from "react";
import calendar_icon from "../../assets/calendar_icon.svg";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  format,
  isSameDay,
  isAfter,
  isBefore,
} from "date-fns";
import "./TwoMonthCalendar.css"; 

import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';

import leftArrow from "../../assets/arrow_down_left.svg";
import rightArrow from "../../assets/arrow_down_right.svg";


// 테스트용 프로필 이미지 import
import profile1 from '../../assets/ProfilePic.png';
import profile2 from '../../assets/ProfilePic02.svg';
import profile3 from '../../assets/ProfilePic03.svg';
import profile4 from '../../assets/ProfilePic04.svg';
import {ReactComponent as ProfileOverflowIcon } from '../../assets/profile_overflow.svg';

// 테스트용 친구 데이터
const mockFriends = [
  { id: 1, name: 'NAME1', email: 'example1@gmail.com', profileImage: profile1 },
  { id: 2, name: 'NAME2', email: 'example2@gmail.com', profileImage: profile2 },
  { id: 3, name: 'NAME3', email: 'example3@gmail.com', profileImage: profile3 },
  { id: 4, name: 'NAME4', email: 'example4@gmail.com', profileImage: profile4 },
  { id: 5, name: 'NAME5', email: 'example5@gmail.com', profileImage: profile1 },
  { id: 6, name: 'NAME6', email: 'example6@gmail.com', profileImage: profile1 },
];  





const TravelSelectDate = ({ formData, updateFormData, recommendedDates, nextStep, prevStep }) => {
  const [title, setTitle] = useState(formData.title || '');
  const [startDate, setStartDate] = useState(formData.startDate || null);
  const [endDate, setEndDate] = useState(formData.endDate || null);

  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); //  replaces monthsToShow

  const today = new Date();

  const handleNext = () => {
    updateFormData({ title, startDate, endDate });
    nextStep();
  };

  const handleClick = (date) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate) {
      if (isSameDay(date, startDate)) {
        setEndDate(date);
        return;
      } else if (isBefore(date, startDate)) {
        setStartDate(null);
        setEndDate(null);
      } else {
        setEndDate(date);
      }
    } else {
      setStartDate(date);
      setEndDate(null);
    }
  };


  const getDateClass = (date) => {
    let recommendedClass = "";

    for (let range of recommendedDates) {
      if (isSameDay(date, range.start) && isSameDay(date, range.end)) {
        recommendedClass = "recommended-single";
        break;
      } else if (isSameDay(date, range.start)) {
        recommendedClass = "recommended-start";
        break;
      } else if (isSameDay(date, range.end)) {
        recommendedClass = "recommended-end";
        break;
      } else if (isAfter(date, range.start) && isBefore(date, range.end)) {
        recommendedClass = "recommended-in-range";
        break;
      }
    }
    
    if (startDate && !endDate && isSameDay(date, startDate)) return "start-only " + recommendedClass;
    if (isSameDay(date, startDate) && isSameDay(date, endDate)) return "start-only " + recommendedClass;
    if (startDate && isSameDay(date, startDate)) return "start " + recommendedClass;
    if (endDate && isSameDay(date, endDate)) return "end " + recommendedClass;
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return "in-range " + recommendedClass;

    return recommendedClass;
  };
    


  return (
    <div>

      

      <div className="calendar-wrapper">
        <div className="choose-title">
          <button onClick={prevStep} className="prev-button"><BackIcon /></button>
          <h3 className="calendar-title">Project name</h3>

        </div>

        {/* Friend Profile Thumbnails (unchanged) */}
        <div className="selcet-friends-profile select-friends">
          {mockFriends.slice(0, 3).map((friend) => (
            <img
              key={friend.id}
              src={friend.profileImage}
              alt={friend.name}
              className="selcet-profile-img"
            />
          ))}
          {mockFriends.length > 4 && (
            <ProfileOverflowIcon className="profile-skip-icon" />
          )}
        </div>

        

        {/* Calendar */}
        <div className="calendar-card">
          <div className="calendar-navigate">
            <button className="navigate-left" onClick={() => setCurrentMonthOffset((prev) => prev - 1)}><img src={leftArrow}/></button>
            <button className="navigate-right" onClick={() => setCurrentMonthOffset((prev) => prev + 1)}><img src={rightArrow}/></button>
          </div>
         
          <div className="calendar-months">
             {[currentMonthOffset, currentMonthOffset + 1].map((offset) => {
            const monthStart = startOfMonth(addMonths(today, offset));
            const monthEnd = endOfMonth(addMonths(today, offset));
            const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

            return (
              <div className="calendar-month" key={offset}>
                <h4 className="month-label">{format(monthStart, "MMMM yyyy")}</h4>
                <div className="calendar-grid-travel">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div className="calendar-day-name" key={d}>{d}</div>
                  ))}

                  {/* 1일 전 빈칸 */}
                  {Array(monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1)
                    .fill("")
                    .map((_, i) => (
                      <div className="calendar-empty" key={`pad-${i}`} />
                    ))}

                  {/* Dates */}
                  {days.map((date) => (
                    <div className="date-wrapper">
                      <div
                      key={date}
                      onClick={() => handleClick(date)}
                      className={`calendar-date ${getDateClass(date)}`}
                    >
                      {format(date, "d")}
                    </div>
                    </div>
                    
                  ))}
                </div>
              </div>
            );
          })}
          </div>
         
        </div>

        <div className="calendar-footer">
          <img className="calendar-icon" src={calendar_icon}/>
          <div className="calendar-show-selected">
            <div>
              <span>start:  </span>
              <span className="calendar-selected-date">{startDate ? format(startDate, "MM/dd") : "--"}</span>
            </div>

            <div>
              <span>end:  </span>
              <span className="calendar-selected-date">{endDate ? format(endDate, "MM/dd") : "--"}</span>


            </div>

          </div>

        </div>
      </div>

      <button className="project-next-button" onClick={handleNext}>
        <ProjectNextIcon />
      </button>
    </div>
  );
};

export default TravelSelectDate;
