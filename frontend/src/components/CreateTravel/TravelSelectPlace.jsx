// src/components/CreateTravel/TravelSelectPlace.jsx
import React, { useState, useEffect } from 'react';
import PlaceMap from '../StandardCreatePage/PlaceMap';

import LocationIcon from '../../icons/LocationIcon';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import x_circle from "../../assets/x_circle.svg";

// Helper function to map Google's place types to our categories
const mapGoogleTypesToCategories = (types) => {
  // Always work with lowercase types to ensure consistency
  const lowerCaseTypes = types.map(type => type.toLowerCase());

  // Priority 1: Check for 'stay' types
  const stayTypes = ['lodging', 'hotel', 'hostel', 'motel', 'resort'];
  if (lowerCaseTypes.some(type => stayTypes.includes(type))) {
    return 'stay';
  }

  // Priority 2: Check for 'dining' types
  const diningTypes = [
    'restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'food'
  ];
  if (lowerCaseTypes.some(type => diningTypes.includes(type))) {
    return 'dining';
  }

  // Priority 3: Check for specific 'place' types
  const placeTypes = [
    'tourist_attraction', 'museum', 'art_gallery', 'park',
    'landmark', 'zoo', 'aquarium', 'amusement_park',
    'shopping_mall', 'store'
  ];
  if (lowerCaseTypes.some(type => placeTypes.includes(type))) {
    return 'place';
  }
  
  // Default to 'place' if no other specific type is found
  return 'place';
};

const TravelSelectPlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredPlace, setHoveredPlace] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedPlaces, setSelectedPlaces] = useState(formData.places || []);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!submittedSearchTerm) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (window.google && window.google.maps && window.google.maps.places) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: submittedSearchTerm,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types'],
        locationBias: {
          center: new window.google.maps.LatLng(37.5665, 126.9780),
          radius: 50000,
        },
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const formattedResults = results.map(result => ({
            id: result.place_id,
            name: result.name,
            address: result.formatted_address,
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            description: '',
            category: mapGoogleTypesToCategories(result.types),
          }));
          setSearchResults(formattedResults);
        } else {
          setSearchResults([]);
          setError('No results found. Please try a different search.');
        }
        setIsLoading(false);
      });
    }
  }, [submittedSearchTerm]);

  const handleSearch = () => {
    setSubmittedSearchTerm(searchTerm);
    setHoveredPlace(null);
    setShowSaved(false);
  };

  const handleSelectPlace = (place) => {
    if (!selectedPlaces.some(p => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
      setHoveredPlace(place);
    }
  };

  const handleUnselectPlace = (placeId) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId));
  };

  const handleNext = () => {
    updateFormData({ places: selectedPlaces });
    nextStep();
  };
  
  const filteredSearchPlaces = searchResults.filter((place) => {
    const matchesCategory = activeTab === 'all' || place.category === activeTab;
    return matchesCategory;
  });

  const filteredSavedPlaces = selectedPlaces.filter((place) => {
    const matchesCategory = activeTab === 'all' || place.category === activeTab;
    return matchesCategory;
  });

  const placesToDisplay = showSaved ? filteredSavedPlaces : filteredSearchPlaces;
  
  return (
    <div className="choose-place-container">
      <div className="choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>{formData.title}</h2>
      </div>

      <div className="choose-content">
        <div className="map-section" style={{ height: '600px' }}>
          <PlaceMap 
            selectedPlace={hoveredPlace} 
            selectedPlaces={selectedPlaces} 
            places={placesToDisplay}
            
          />
        </div>

        <div className="choose-search-panel">
          <div className="tab category-tabs toggle-buttons-container">
                <button
                    className={`toggle-button ${!showSaved ? 'active' : ''}`}
                    onClick={() => setShowSaved(false)}
                    disabled={!showSaved}
                >
                    Search
                </button>
                <button
                    className={`toggle-button ${showSaved ? 'active' : ''}`}
                    onClick={() => setShowSaved(true)}
                    disabled={showSaved}
                >
                    Saved ({selectedPlaces.length})
                </button>
            </div>
          <div className="tab category-tabs">
            
            {['all', 'place', 'dining', 'stay'].map(tab => (
              <button
                key={tab}
                className={`category-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setHoveredPlace(null);
                }}
                disabled={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          
          <div className="choose-search-bar-and-toggle">
            <div className="choose-search-bar">
              <input
                type="text"
                placeholder="searching place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button className="choose-search-button" onClick={handleSearch}><SearchIcon /></button>
            </div>
            
            
          </div>

          <ul className="place-list" >
            {isLoading && !showSaved && <p>Searching for places...</p>}
            {error && !showSaved && <p className="error-message">{error}</p>}
            {!isLoading && placesToDisplay.length === 0 && (
              <p>{showSaved ? 'You have no saved places in this category.' : 'No places found. Try a different search term.'}</p>
            )}

            {!isLoading && placesToDisplay.map((place) => {
              const isSelected = selectedPlaces.some(p => p.id === place.id);
              return (
                <li
                  key={place.id}
                  className={`place-item ${isSelected ? 'selected' : 'not-selected'}`}
                  onClick={() => handleSelectPlace(place)}
                  onMouseEnter={() => setHoveredPlace(place)}
                  onMouseLeave={() => setHoveredPlace(null)}
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
                        <img src={x_circle} alt="remove" />
                      </button>
                    )}
                  </div>
                  <div className="place-address" >{place.address}</div>
                  <div className="place-desc" style={{color:"#EEF1F6"}}>
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