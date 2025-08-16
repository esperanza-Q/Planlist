import React, { useState, useEffect } from 'react';
import PlaceMap from './PlaceMap';
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import '../CreateTravel/TravelSelectPlace.css'

import LocationIcon from '../../icons/LocationIcon';
import { ReactComponent as BackIcon } from '../../assets/prev_arrow.svg';
import { ReactComponent as ProjectNextIcon } from "../../assets/Project_next_button.svg";
import { ReactComponent as SearchIcon } from '../../assets/Search.svg';
import x_circle from "../../assets/x_circle.svg";
import TravelCreatePage from '../../pages/CreateCategory/TravelCreatePage';
import CreateTravel from '../CreateTravel/CreateTravel';

// --- helpers ---
const mapGoogleTypesToCategories = (types) => {
  const lowerCaseTypes = (types ?? []).map(t => t.toLowerCase());
  const stayTypes = ['lodging', 'hotel', 'hostel', 'motel', 'resort'];
  if (lowerCaseTypes.some(t => stayTypes.includes(t))) return 'stay';
  const diningTypes = ['restaurant','cafe','bar','bakery','meal_takeaway','food'];
  if (lowerCaseTypes.some(t => diningTypes.includes(t))) return 'dining';
  const placeTypes = [
    'tourist_attraction','museum','art_gallery','park',
    'landmark','zoo','aquarium','amusement_park','shopping_mall','store'
  ];
  if (lowerCaseTypes.some(t => placeTypes.includes(t))) return 'place';
  return 'place';
};

const StandardSelectPlace = ({ formData, updateFormData, nextStep, prevStep }) => {
  const navigate = useNavigate();

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

    if (window.google?.maps?.places) {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const request = {
        query: submittedSearchTerm,
        fields: ['place_id','name','formatted_address','geometry','types'],
        locationBias: { center: new window.google.maps.LatLng(37.5665,126.9780), radius: 50000 },
      };

      service.textSearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const formatted = results.map(r => ({
            id: r.place_id,
            name: r.name,
            address: r.formatted_address,
            lat: r.geometry.location.lat(),
            lng: r.geometry.location.lng(),
            description: '',
            category: mapGoogleTypesToCategories(r.types),
          }));
          setSearchResults(formatted);
        } else {
          setSearchResults([]);
          setError('No results found. Please try a different search.');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      setError('Google Places 라이브러리를 불러오지 못했습니다.');
    }
  }, [submittedSearchTerm]);

  const handleSearch = () => {
    setSubmittedSearchTerm(searchTerm);
    setHoveredPlace(null);
    setShowSaved(false);
  };

  const handleSelectPlace = (place) => {
    if (!selectedPlaces.some(p => p.id === place.id)) {
      setSelectedPlaces(prev => [...prev, place]);
      setHoveredPlace(place);
    }
  };

  const handleUnselectPlace = (placeId) => {
    setSelectedPlaces(prev => prev.filter(p => p.id !== placeId));
  };

  // ✅ async 로 선언 + await 사용
    // StandardSelectPlace.jsx
    const handleNext = async () => {
    updateFormData({ places: selectedPlaces });

    const projectId = formData?.projectId;   // ✅ 프로젝트 상세 라우트용
    const plannerId = formData?.plannerId;   // ✅ 기존 API용 (있다면)

    if (!projectId) {
        alert("projectId가 없습니다.");
        return;
    }

    try {
        // (선택) 미리 서버 warm-up
        if (plannerId) {
        await api.get("/api/standard/project/sharePlanner", { params: { plannerId } });
        }

        // 방법 A: state로 plannerId 같이 넘기기 (권장)
        navigate(`/project/${encodeURIComponent(projectId)}`, { state: { plannerId } });

        // (대안) 방법 B: 쿼리로 같이 넘기기
        // navigate(`/project/${encodeURIComponent(projectId)}?plannerId=${encodeURIComponent(plannerId)}`);
    } catch (e) {
        console.error("sharePlanner 실패:", e);
        alert("공유 정보 불러오기 실패");
    }
    };

  // 필터링은 컴포넌트 내부에서, return 위에 있어야 함
  const filteredSearchPlaces = searchResults.filter(p => activeTab === 'all' || p.category === activeTab);
  const filteredSavedPlaces = selectedPlaces.filter(p => activeTab === 'all' || p.category === activeTab);
  const placesToDisplay = showSaved ? filteredSavedPlaces : filteredSearchPlaces;

  return (
    <div className="travel-choose-place-container">
      <div className="travel-choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>{formData.title}</h2>
      </div>

      <div className="travel-choose-content">
        <div className="travel-map-section" style={{ height: '600px' }}>
          <PlaceMap
            selectedPlace={hoveredPlace}
            selectedPlaces={selectedPlaces}
            places={placesToDisplay}
          />
        </div>

        <div className="travel-choose-search-panel">
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

          <div className="travel-choose-search-bar-and-toggle">
            <div className="travel-choose-search-bar">
              <input
                type="text"
                placeholder="searching place..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button className="travel-choose-search-button" onClick={handleSearch}><SearchIcon /></button>
            </div>
          </div>

          <ul className="travel-place-list">
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
                  className={`travel-place-item ${isSelected ? 'selected' : 'not-selected'}`}
                  onClick={() => handleSelectPlace(place)}
                  onMouseEnter={() => setHoveredPlace(place)}
                  onMouseLeave={() => setHoveredPlace(null)}
                >
                  <div className="travel-place-title">
                    <LocationIcon color={isSelected ? "#081F5C" : "#BAD6EB"} />
                    <span>{place.name}</span>
                    {isSelected && (
                      <button
                        className="travel-remove-button"
                        onClick={(e) => { e.stopPropagation(); handleUnselectPlace(place.id); }}
                      >
                        <img src={x_circle} alt="remove" />
                      </button>
                    )}
                  </div>
                  <div className="travel-place-address">{place.address}</div>
                  <div className="travel-place-desc" style={{ color: "#EEF1F6" }}>
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

export default StandardSelectPlace;
