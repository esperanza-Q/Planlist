import React, { useState } from 'react';
import PlaceMap from './PlaceMap'; // 지도 컴포넌트
import './ChoosePlace.css';

const ChoosePlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(formData.place || null);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/search-place?keyword=${searchTerm}`);
      const data = await response.json();
      setPlaces(data.results || []);
    } catch (err) {
      console.error('장소 검색 실패:', err);
    }
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const handleNext = () => {
    updateFormData({ place: selectedPlace });
    nextStep();
  };

  return (
    <div className="choose-place-container">
      <h2>◎ Choosing a Place</h2>

      <div className="map-section">
        <PlaceMap selectedPlace={selectedPlace} />
      </div>

      <div className="search-panel">
        <input
          type="text"
          placeholder="searching place..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>🔍</button>

        <ul className="place-list">
          {places.map((place, idx) => (
            <li
              key={idx}
              className={`place-item ${selectedPlace?.id === place.id ? 'selected' : ''}`}
              onClick={() => handleSelectPlace(place)}
            >
              <div className="place-title">{place.name}</div>
              <div className="place-address">{place.address}</div>
              <div className="place-desc">{place.description || 'description about this place...'}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bottom-right">
        <button onClick={handleNext}>→</button>
      </div>
    </div>
  );
};

export default ChoosePlace;
