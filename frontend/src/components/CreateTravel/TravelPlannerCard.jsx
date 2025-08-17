// src/components/TravelPlannerCard.jsx
import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval } from 'date-fns';
import LocationIcon from '../../icons/LocationIcon';
import x_circle from "../../assets/x_circle.svg";
import arrow_long from "../../assets/arrow_long.svg";
import bus from "../../assets/bus.svg";
import PlaceSelectionPopup from './PlaceSelectionPopup';

// --- helpers ---
const newTraffic = () => ({ type: 'traffic', data: { kind: 'walk', duration: '0' } });

/**
 * Normalize a day's entries so that:
 *  - No leading traffic (but trailing traffic IS allowed)
 *  - (Optional) leave consecutive traffics as-is (user can chain trailing segments)
 *  - If two places become adjacent (e.g., user removed a middle traffic), auto-insert a traffic
 */
const normalizeDay = (entries) => {
  const out = [];
  for (const e of entries) {
    if (e.type === 'traffic') {
      // skip leading traffic
      if (out.length === 0) continue;
      out.push(e);
      continue;
    }
    if (e.type === 'place') {
      const last = out[out.length - 1];
      if (last?.type === 'place') out.push(newTraffic()); // enforce between places
      out.push(e);
      continue;
    }
  }
  // allow trailing traffic (do NOT remove)
  return out;
};

const TravelPlannerCard = ({ formData, setPlacesForDates, setHoveredPlace }) => {
  const [itinerary, setItinerary] = useState({});
  const [dateList, setDateList] = useState([]);
  const [activeDate, setActiveDate] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // build date tabs
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

  // add place (auto insert traffic if last is place)
  const handleAddPlace = (place) => {
    const next = [...currentList];
    const last = next[next.length - 1];
    if (last?.type === 'place') next.push(newTraffic());
    next.push({ type: 'place', data: { ...place, time: '' } });

    setItinerary(prev => ({
      ...prev,
      [activeDate]: normalizeDay(next)
    }));
    setShowPopup(false);
  };

  // add trailing traffic (button only at end)
  const handleAddTrailingTraffic = () => {
    const next = [...currentList, newTraffic()];
    setItinerary(prev => ({
      ...prev,
      [activeDate]: normalizeDay(next)
    }));
  };

  // remove (block removing the ONLY traffic between two places; allow removing trailing traffic)
  const handleRemoveEntry = (index) => {
    const before = currentList[index - 1];
    const target = currentList[index];
    const after  = currentList[index + 1];

    // traffic between two places must exist — if it's the ONLY one right now, block removal
    if (target?.type === 'traffic' && before?.type === 'place' && after?.type === 'place') {
      // Check if there are other traffic segments between these two places
      // scan outward until next place on each side
      let hasOtherTrafficBetween = false;
      // left scan to previous place
      let i = index - 1;
      while (i >= 0 && currentList[i].type !== 'place') {
        if (i !== index && currentList[i].type === 'traffic') { hasOtherTrafficBetween = true; break; }
        i--;
      }
      // right scan to next place
      i = index + 1;
      while (!hasOtherTrafficBetween && i < currentList.length && currentList[i].type !== 'place') {
        if (i !== index && currentList[i].type === 'traffic') { hasOtherTrafficBetween = true; break; }
        i++;
      }

      if (!hasOtherTrafficBetween) {
        alert('장소 사이의 이동은 반드시 1개 이상 필요합니다.');
        return;
      }
    }

    const next = [...currentList];
    next.splice(index, 1);
    setItinerary(prev => ({
      ...prev,
      [activeDate]: normalizeDay(next)
    }));
  };

  const updateEntryData = (index, field, value) => {
    const next = [...currentList];
    next[index] = { ...next[index], data: { ...next[index].data, [field]: value } };
    setItinerary(prev => ({
      ...prev,
      [activeDate]: normalizeDay(next)
    }));
  };

  // emit scheduled places w/ transportations attached to the *arrival* place; trailing traffic attaches to last place
  useEffect(() => {
    const allScheduledPlaces = [];
    for (const [date, entries] of Object.entries(itinerary)) {
      let pendingMoves = [];
      let lastPlaceIdx = -1;

      for (const entry of entries) {
        if (entry.type === 'traffic') {
          pendingMoves.push({
            kind: entry.data.kind || 'walk',
            duration: entry.data.duration ?? '0'
          });
        } else if (entry.type === 'place') {
          const enriched = {
            ...entry.data,
            date,
            transportations: pendingMoves.length ? [...pendingMoves] : []
          };
          allScheduledPlaces.push(enriched);
          lastPlaceIdx = allScheduledPlaces.length - 1;
          pendingMoves = [];
        }
      }

      // trailing moves → attach to last place of that day
      if (pendingMoves.length && lastPlaceIdx >= 0) {
        const last = allScheduledPlaces[lastPlaceIdx];
        last.transportations = [...(last.transportations || []), ...pendingMoves];
      }
    }
    setPlacesForDates(allScheduledPlaces);
  }, [itinerary, setPlacesForDates]);

  const hasAnyPlace = currentList.some(e => e.type === 'place');

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
          return (
            <React.Fragment key={index}>
              <li
                className={`entry ${entry.type}`}
                onMouseEnter={() => isPlace && setHoveredPlace(entry.data)}
                onMouseLeave={() => isPlace && setHoveredPlace(null)}
              >
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
                        <img src={x_circle} alt="Remove place" />
                      </button>
                    </div>
                    <input
                      type="time"
                      value={entry.data.time || ''}
                      onChange={(e) => updateEntryData(index, 'time', e.target.value)}
                      placeholder="HH:MM"
                      style={{ marginLeft: '10px' }}
                    />
                  </div>
                ) : (
                  <div className="move-item">
                    <img className="arrow" src={arrow_long} alt="arrow" />
                    <img className="buts" src={bus} alt="bus" />
                    <div className="move-item-data">
                      <select
                        value={entry.data.kind}
                        onChange={(e) => updateEntryData(index, 'kind', e.target.value)}
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
                        onChange={(e) => updateEntryData(index, 'duration', e.target.value)}
                      />
                      <span>min</span>
                    </div>
                    <button
                      className="traffic-remove-button"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      <img src={x_circle} alt="Remove traffic" />
                    </button>
                  </div>
                )}
              </li>
            </React.Fragment>
          );
        })}

        {/* END controls: show Add Traffic only here, then Add Place */}
        {hasAnyPlace && (
          <li>
            <button
              className="planner-add-traffic-button"
              onClick={handleAddTrailingTraffic}
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
