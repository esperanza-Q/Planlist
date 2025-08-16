import React, { useState } from 'react';
import PlaceMap from './PlaceMap';
import './ChoosePlace.css';

import LocationIcon from '../../icons/LocationIcon';

import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';

const ChoosePlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [places, setPlaces] = useState([
    // 💡 테스트용 mock 데이터
    { id: 1, name: 'place name', address: 'Seoul, Seongbuk-gu...', description: '' },
    { id: 2, name: 'place name', address: 'Seoul, Seongbuk-gu...', description: '' },
    { id: 3, name: 'place name', address: 'Seoul, Seongbuk-gu...', description: '' },
  ]);
  const [selectedPlace, setSelectedPlace] = useState(formData.place || null);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const handleNext = () => {
    updateFormData({ place: selectedPlace });
    nextStep();
  };

  return (
    <div className="choose-place-container">
        <div className="choose-title">
            <button onClick={prevStep} className="prev-button"><BackIcon /></button>
            <h2> Choosing a Place</h2>
        </div>

      <div className="choose-content">
        <div className="map-section">
          <PlaceMap selectedPlace={selectedPlace} />
        </div>

        <div className="choose-search-panel">
          <div className="choose-search-bar">
            <input
              type="text"
              placeholder="searching place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="choose-search-button"><SearchIcon /></button>
          </div>

          <ul className="place-list">
            {places.map((place, idx) => {
                const isSelected = selectedPlace?.id === place.id;

                return (
                <li
                    key={idx}
                    className={`place-item ${isSelected ? 'selected' : 'not-selected'}`}
                    onClick={() => handleSelectPlace(place)}
                >
                    <div className="place-title">
                    <LocationIcon color={isSelected ? "#081F5C" : "#BAD6EB"} />
                    <span>{place.name}</span>
                    </div>
                    <div className="place-address">{place.address}</div>
                    <div className="place-desc">
                    {place.description || 'description about the place......'}
                    </div>
                </li>
                );
            })}
            </ul>

        </div>
      </div>

      <button className="project2-next-button" onClick={handleNext}><ProjectNextIcon /></button>
    </div>
  );
};

export default ChoosePlace;
