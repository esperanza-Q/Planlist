// src/components/TravelPlannerCard.jsx
import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import LocationIcon from '../../icons/LocationIcon';
import x_circle from "../../assets/x_circle.svg";
import arrow_long from "../../assets/arrow_long.svg";
import bus from "../../assets/bus.svg";
import PlaceSelectionPopup from './PlaceSelectionPopup';

const TravelPlannerCard = ({ formData, setPlacesForDates }) => {
  const [itinerary, setItinerary] = useState({});
  const [dateList, setDateList] = useState([]);
  const [activeDate, setActiveDate] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Generate date list from formData
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const allDates = eachDayOfInterval({
        start: new Date(formData.startDate),
        end: new Date(formData.endDate)
      }).map(d => format(d, 'MM/dd'));
      setDateList(allDates);
      setActiveDate(allDates[0]);
    }
  }, [formData.startDate, formData.endDate]);

  const currentList = itinerary[activeDate] || [];

  const handleAddPlace = (place) => {
    const updated = [
      ...currentList,
      { type: 'place', data: { ...place, time: '' } }
    ];
    setItinerary(prev => ({ ...prev, [activeDate]: updated }));
    setShowPopup(false);
  };

  const handleInsertTraffic = (index) => {
    const updated = [...currentList];
    updated.splice(index, 0, { type: 'traffic', data: { kind: 'walk', duration: '' } });
    setItinerary(prev => ({ ...prev, [activeDate]: updated }));
  };

  const handleRemoveEntry = (index) => {
    const updated = [...currentList];
    updated.splice(index, 1);
    setItinerary(prev => ({ ...prev, [activeDate]: updated }));
  };

  const updateEntryData = (index, field, value) => {
    const updated = [...currentList];
    updated[index].data[field] = value;
    setItinerary(prev => ({ ...prev, [activeDate]: updated }));
  };

  // Whenever itinerary changes, update parent formData.places
  useEffect(() => {
    const allScheduledPlaces = [];
    for (const [date, entries] of Object.entries(itinerary)) {
      entries.forEach(entry => {
        if (entry.type === 'place') {
          allScheduledPlaces.push({ ...entry.data, date });
        }
      });
    }
    setPlacesForDates(allScheduledPlaces);
  }, [itinerary, setPlacesForDates]);

  return (
    <div>
      {/* Date Tabs */}
      <div className="tab date-tabs">
        {dateList.map(date => (
          <button
            key={date}
            className={`date-tab ${activeDate === date ? 'active' : ''}`}
            onClick={() => setActiveDate(date)}
            disabled={activeDate === date}
          >
            {date}
          </button>
        ))}
      </div>

      {/* Itinerary List */}
      <ul className="itinerary-list">
        {currentList.map((entry, index) => {
          const isPlace = entry.type === 'place';
          const next = currentList[index + 1];
          const showAddTrafficBetween = isPlace && next?.type === 'place';

          return (
            <React.Fragment key={index}>
              <li className={`entry ${entry.type}`}>
                {isPlace ? (
                  <div className='planner-containerdiv'>
                    <div className="planner-place-item">
                      <LocationIcon color={"#334EAC"} />
                      <div className='planner-place-content'>
                        <span className='place-title'>{entry.data.name}</span>
                        <div className="place-address">{entry.data.address}</div>
                        <div className="place-desc">
                          {entry.data.description || 'description about the place......'}
                        </div>
                      </div>
                      <button
                        className="place-remove-button"
                        onClick={() => handleRemoveEntry(index)}
                      >
                        <img src={x_circle}/>
                      </button>
                    </div>
                    <input
                      type="time"
                      value={entry.data.time}
                      onChange={(e) =>
                        updateEntryData(index, 'time', e.target.value)
                      }
                      placeholder="HH:MM"
                      style={{ marginLeft: '10px' }}
                    />
                  </div>
                ) : (
                  <div className="move-item">
                    <img className="arrow" src={arrow_long}/>
                    <img className="buts" src={bus}/>
                    <div className="move-item-data">
                      <select
                        value={entry.data.kind}
                        onChange={(e) =>
                          updateEntryData(index, 'kind', e.target.value)
                        }
                      >
                        <option value="walk">Walk</option>
                        <option value="car">Car</option>
                        <option value="bus">Bus</option>
                        <option value="subway">Subway</option>
                      </select>
                      <input
                        className='move-item-input'
                        type="text"
                        placeholder="Duration"
                        value={entry.data.duration}
                        onChange={(e) =>
                          updateEntryData(index, 'duration', e.target.value)
                        }
                      />
                      <span>min</span>
                    </div>
                    <button
                      className="traffic-remove-button"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      <img src={x_circle}/>
                    </button>
                  </div>
                )}
              </li>

              {showAddTrafficBetween && (
                <li >
                  <button className="planner-add-traffic-button" onClick={() => handleInsertTraffic(index + 1)}>Add Traffic</button>
                </li>
              )}
            </React.Fragment>
          );
        })}

        {/* Add buttons at the end */}
        {(() => {
          const last = currentList[currentList.length - 1];
          const allowTrailingTraffic = last?.type === 'place';
          return (
            <>
              {allowTrailingTraffic && (
                <li>
                  <button
                    className="planner-add-traffic-button"
                    onClick={() => handleInsertTraffic(currentList.length)}
                  >
                    Add Traffic
                  </button>
                </li>
              )}
              <li>
                <button
                  className="planner-add-place-button"
                  onClick={() => setShowPopup(true)}
                >
                  Add Place
                </button>
              </li>
            </>
          );
        })()}
      </ul>

      {/* Popup */}
      {showPopup && (
        <PlaceSelectionPopup
          places={formData.places}
          onSelect={handleAddPlace}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default TravelPlannerCard;
