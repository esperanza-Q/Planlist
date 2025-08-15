import React from 'react';
import './Planlist_HeaderBar.css';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from 'date-fns';
import { ReactComponent as ArrowLeft } from "../../assets/arrow_down_left.svg";
import { ReactComponent as ArrowRight } from "../../assets/arrow_down_right.svg";


const Planlist_HeaderBar = ({
  currentDate,
  setCurrentDate,
  viewMode,
  setViewMode,
}) => {
  const goToToday = () => setCurrentDate(new Date());

  const goToPrev = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      default:
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      default:
        break;
    }
  };

  const toggleView = (e) => setViewMode(e.target.value);

  return (
    <div className="Planlist-calendar-header">
      <div className="Planlist-left-controls">
        <button onClick={goToToday} className='Today-button'>Today</button>
        <span className="Planlist-date-display">{format(new Date(), 'MMM dd')}</span>
        <span className="Planlist-time-display"> <span className="red-dot" /> {format(new Date(), 'p')} KST</span>
      </div>

      <div className="Planlist-right-controls">
        <button onClick={goToPrev} className="nav-btn02"> <ArrowLeft /> </button>
        <button onClick={goToNext} className="nav-btn02"> <ArrowRight /></button>
        <select value={viewMode} onChange={toggleView} className='selectPlanlist'>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
    </div>
  );
};

export default Planlist_HeaderBar;
