import React, { useState } from 'react';
import PlaceMap from '../StandardCreatePage/PlaceMap';

import LocationIcon from '../../icons/LocationIcon';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import x_circle from "../../assets/x_circle.svg";


const TravelSelectPlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [places] = useState([
    { id: 1, name: 'Namsan Tower', address: 'Seoul, Yongsan-gu', description: '', category: 'place' },
    { id: 2, name: 'Gwangjang Market', address: 'Seoul, Jongno-gu', description: '', category: 'dining' },
    { id: 3, name: 'Lotte Hotel', address: 'Seoul, Jung-gu', description: '', category: 'stay' },
    { id: 4, name: 'Bukchon Hanok Village', address: 'Seoul, Jongno-gu', description: '', category: 'place' },
  ]);

  const [selectedPlaces, setSelectedPlaces] = useState(formData.places || []);

  const handleSelectPlace = (place) => {
    if (!selectedPlaces.some(p => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  const handleUnselectPlace = (placeId) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId));
  };

  const handleNext = () => {
    updateFormData({ places: selectedPlaces });
    nextStep();
  };

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'all' || place.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="choose-place-container">
      <div className="choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>Project name</h2>
      </div>

      <div className="choose-content">
        <div className="map-section">
          <PlaceMap selectedPlace={selectedPlaces[0] || null} />
        </div>

        <div className="choose-search-panel">
          {/* Category Tabs */}
          <div className="tab category-tabs">
            {['all', 'place', 'dining', 'stay'].map(tab => (
              <button
                key={tab}
                className={`category-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="choose-search-bar">
            <input
              type="text"
              placeholder="searching place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="choose-search-button"><SearchIcon /></button>
          </div>

          {/* Place List */}
          <ul className="place-list">
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlaces.some(p => p.id === place.id);

              return (
                <li
                  key={place.id}
                  className={`place-item ${isSelected ? 'selected' : 'not-selected'}`}
                  onClick={() =>
                     handleSelectPlace(place)
                  }
                >
                  <div className="place-title" >
                    <LocationIcon color={isSelected ? "#081F5C" : "#BAD6EB"} />
                    
                    <span>{place.name}</span>
                    {isSelected && (
                      <button
                        className="remove-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnselectPlace(place.id);
                        }}
                      >
                        <img src={x_circle} />
                      </button>
                    )}
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

export default TravelSelectPlace;
