// src/components/CreateTravel/FinalMap.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PlaceMap from '../StandardCreatePage/PlaceMap';
import LocationIcon from '../../icons/LocationIcon';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import SaveIcon from '../../icons/SaveIcon';
import { format, eachDayOfInterval } from 'date-fns';
import "./TravelSelectPlace.css";

// Helpers
const normalizeCat = (c) => {
  const v = String(c || "").trim().toLowerCase();
  if (["place", "장소", "spot", "poi"].includes(v)) return "place";
  if (["restaurant", "dining", "food", "식당", "맛집"].includes(v)) return "dining";
  if (["accommodation", "accomodation", "stay", "숙소", "hotel", "lodge"].includes(v)) return "stay";
  return "place";
};

const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").trim());
  return Number.isFinite(n) ? n : null;
};

// Convert place to a safe marker object. If coords invalid, return null.
const toMapPoint = (p) => {
  const lat = num(p.latitude ?? p.lat ?? p.y);
  const lng = num(p.longitude ?? p.lng ?? p.lon ?? p.x);
  if (lat == null || lng == null) return null;
  return { ...p, lat, lng, _cat: normalizeCat(p.category) };
};

const predefinedCategories = ['place', 'dining', 'stay'];

const FinalMap = ({ formData, updateFormData, nextStep, prevStep }) => {
  const navigate = useNavigate();

  const [dateTabs, setDateTabs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDate, setActiveDate] = useState('All');

  // mirror TravelSelectPlace — pass hoveredPlace to the map
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState(null);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const dates = eachDayOfInterval({
        start: new Date(formData.startDate),
        end: new Date(formData.endDate),
      }).map(d => format(d, 'MM/dd'));
      setDateTabs(dates);
    }
  }, [formData.startDate, formData.endDate]);

  // Prefer scheduledPlaces set by Step 5; fallback to places from Step 4
  const sourcePlaces =
    (Array.isArray(formData.scheduledPlaces) && formData.scheduledPlaces.length > 0)
      ? formData.scheduledPlaces
      : (formData.places || []);

  // Only show entries with a date for tabs/list
  const datedPlaces = useMemo(
    () => sourcePlaces.filter(p => p.date).map(p => ({ ...p, _cat: normalizeCat(p.category) })),
    [sourcePlaces]
  );

  const filteredPlaces = useMemo(() => {
    return datedPlaces.filter((place) => {
      const matchCategory = activeCategory === 'All' || place._cat === activeCategory;
      const matchDate = activeDate === 'All' || place.date === activeDate;
      return matchCategory && matchDate;
    });
  }, [datedPlaces, activeCategory, activeDate]);

  // Sanitize for the map: require numeric lat/lng
  const mapPoints = useMemo(() => filteredPlaces.map(toMapPoint).filter(Boolean), [filteredPlaces]);

  const handlePlaceClick = (place) => {
    const pt = toMapPoint(place);
    setSelectedPlaceForMap(pt || null);
  };

  // Keep hoveredPlace in a map-safe shape (or null)
  const handleHover = (place) => setHoveredPlace(toMapPoint(place));
  const clearHover = () => setHoveredPlace(null);

  // If selected place falls out after filters change, clear it
  useEffect(() => {
    if (!selectedPlaceForMap) return;
    const exists = mapPoints.some(p =>
      (p.id ?? `${p.name}-${p.date}`) === (selectedPlaceForMap.id ?? `${selectedPlaceForMap.name}-${selectedPlaceForMap.date}`)
    );
    if (!exists) setSelectedPlaceForMap(null);
  }, [mapPoints, selectedPlaceForMap]);

  const handleSave = async () => {

        const pid = formData.projectId;
        if (pid) {
          navigate(`/project/travel/${encodeURIComponent(pid)}`);
        } else {
          navigate('/project/travel');
        }

  };

  return (
    <div className="travel-choose-place-container">
      <div className="travel-choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>{formData.title}</h2>
      </div>

      <div className="travel-choose-content">
        <div className="travel-map-section">
          {/* pass hoveredPlace just like TravelSelectPlace does */}
          <PlaceMap places={mapPoints} selectedPlace={selectedPlaceForMap} hoveredPlace={hoveredPlace} />
        </div>

        <div className="travel-choose-search-panel">
          {/* Category Tabs */}
          <div className="tab travel-category-tabs">
            {['All', ...predefinedCategories].map((tab) => (
              <button
                key={tab}
                className={`category-tab ${activeCategory === tab ? 'active' : ''}`}
                onClick={() => setActiveCategory(tab)}
                disabled={activeCategory === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Date Tabs */}
          <div className="tab date-tabs">
            {['All', ...dateTabs].map((tab) => (
              <button
                key={tab}
                className={`date-tab ${activeDate === tab ? 'active' : ''}`}
                onClick={() => setActiveDate(tab)}
                disabled={activeDate === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Place List */}
          <ul className="travel-place-list">
            {filteredPlaces.length === 0 ? (
              <li>선택에 해당하는 장소가 없습니다.</li>
            ) : (
              filteredPlaces.map((place) => (
                <li
                  key={place.id ?? `${place.name}-${place.date}`}
                  className="travel-place-item selected"
                  onClick={() => handlePlaceClick(place)}
                  onMouseEnter={() => handleHover(place)}
                  onMouseLeave={clearHover}
                >
                  <div className="travel-place-title">
                    <LocationIcon color="#081F5C" />
                    <span>{place.name}</span>
                  </div>
                  <div className="travel-place-address">{place.address}</div>
                  <div className="travel-place-desc">
                    {place.description || 'No description...'}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="save-project-bottom-right">
        <button className="save-project-save-button" onClick={handleSave}>
          Save <SaveIcon />
        </button>
      </div>
    </div>
  );
};

export default FinalMap;
