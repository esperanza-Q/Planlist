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

  // 하드코딩된 데이터는 그대로 유지합니다.
  const [places] = useState([
    { id: 1, name: 'Namsan Tower', address: 'Seoul, Yongsan-gu', description: '', category: 'place', lat: 37.5512, lng: 126.9882 },
    { id: 2, name: 'Gwangjang Market', address: 'Seoul, Jongno-gu', description: '', category: 'dining', lat: 37.5701, lng: 126.9998 },
    { id: 3, name: 'Lotte Hotel', address: 'Seoul, Jung-gu', description: '', category: 'stay', lat: 37.5646, lng: 126.9798 },
    { id: 4, name: 'Bukchon Hanok Village', address: 'Seoul, Jongno-gu', description: '', category: 'place', lat: 37.5829, lng: 126.9837 },
    { id: 5, name: 'Changdeokgung Palace', address: 'Seoul, Jongno-gu', description: '', category: 'place', lat: 37.5794, lng: 126.9909 },
    { id: 6, name: 'Namdaemun Market', address: 'Seoul, Jung-gu', description: '', category: 'dining', lat: 37.5596, lng: 126.9765 },
    { id: 7, name: 'The Shilla Seoul', address: 'Seoul, Jung-gu', description: '', category: 'stay', lat: 37.5583, lng: 127.0050 },
    { id: 8, name: 'Dongdaemun Design Plaza', address: 'Seoul, Jung-gu', description: '', category: 'place', lat: 37.5660, lng: 127.0093 },
    { id: 9, name: 'Itaewon Street', address: 'Seoul, Yongsan-gu', description: '', category: 'dining', lat: 37.5348, lng: 126.9904 },
    { id: 10, name: 'Grand Hyatt Seoul', address: 'Seoul, Yongsan-gu', description: '', category: 'stay', lat: 37.5323, lng: 127.0016 },
    { id: 11, name: 'Seoul Forest', address: 'Seoul, Seongdong-gu', description: '', category: 'place', lat: 37.5445, lng: 127.0427 },
    { id: 12, name: 'Mangwon Market', address: 'Seoul, Mapo-gu', description: '', category: 'dining', lat: 37.5562, lng: 126.9069 },
    { id: 13, name: 'Conrad Seoul', address: 'Seoul, Yeongdeungpo-gu', description: '', category: 'stay', lat: 37.5252, lng: 126.9242 },
    { id: 14, name: 'Gyeongbokgung Palace', address: 'Seoul, Jongno-gu', description: '', category: 'place', lat: 37.5799, lng: 126.9769 },
    { id: 15, name: 'Tongin Market', address: 'Seoul, Jongno-gu', description: '', category: 'dining', lat: 37.5795, lng: 126.9680 },
    { id: 16, name: 'Four Seasons Hotel Seoul', address: 'Seoul, Jongno-gu', description: '', category: 'stay', lat: 37.5707, lng: 126.9764 },
    { id: 17, name: 'Han River Park', address: 'Seoul, Yeouido', description: '', category: 'place', lat: 37.5284, lng: 126.9329 },
    { id: 18, name: 'Garak Market', address: 'Seoul, Songpa-gu', description: '', category: 'dining', lat: 37.4913, lng: 127.1182 },
    { id: 19, name: 'Signiel Seoul', address: 'Seoul, Songpa-gu', description: '', category: 'stay', lat: 37.5133, lng: 127.1027 },
    { id: 20, name: 'Seodaemun Prison History Hall', address: 'Seoul, Seodaemun-gu', description: '', category: 'place', lat: 37.5746, lng: 126.9560 },
    { id: 21, name: 'Gyeongdong Market', address: 'Seoul, Dongdaemun-gu', description: '', category: 'dining', lat: 37.5855, lng: 127.0375 },
    { id: 22, name: 'Novotel Ambassador Seoul Yongsan', address: 'Seoul, Yongsan-gu', description: '', category: 'stay', lat: 37.5298, lng: 126.9649 },
    { id: 23, name: 'Bukhansan National Park', address: 'Seoul, Gangbuk-gu', description: '', category: 'place', lat: 37.6593, lng: 127.0097 },
    { id: 24, name: 'Majang Meat Market', address: 'Seoul, Seongdong-gu', description: '', category: 'dining', lat: 37.5684, lng: 127.0425 },
    { id: 25, name: 'InterContinental Seoul COEX', address: 'Seoul, Gangnam-gu', description: '', category: 'stay', lat: 37.5134, lng: 127.0565 },
    { id: 26, name: 'Bongeunsa Temple', address: 'Seoul, Gangnam-gu', description: '', category: 'place', lat: 37.5147, lng: 127.0560 },
    { id: 27, name: 'Yangnyeong Market', address: 'Seoul, Dongdaemun-gu', description: '', category: 'dining', lat: 37.5750, lng: 127.0189 },
    { id: 28, name: 'JW Marriott Hotel Seoul', address: 'Seoul, Seocho-gu', description: '', category: 'stay', lat: 37.5050, lng: 127.0039 },
    { id: 29, name: 'Seoul City Hall', address: 'Seoul, Jung-gu', description: '', category: 'place', lat: 37.5663, lng: 126.9780 },
    { id: 30, name: 'Cheonggyecheon Stream', address: 'Seoul, Jongno-gu', description: '', category: 'place', lat: 37.5694, lng: 126.9829 },
    { id: 31, name: 'COEX Mall', address: 'Seoul, Gangnam-gu', description: '', category: 'place', lat: 37.5118, lng: 127.0594 }
  ]);

  const [selectedPlaces, setSelectedPlaces] = useState(formData.places || []);

  const handleSelectPlace = (place) => {
    // 선택된 장소에 위도/경도 정보가 없으면 추가해주는 로직이 필요합니다.
    // 기존 데이터에 lat, lng를 추가했습니다.
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
      {/* ... (기존 UI) */}
      <div className="choose-title">
        <button onClick={prevStep} className="prev-button"><BackIcon /></button>
        <h2>Project name</h2>
      </div>

      <div className="choose-content">
        <div className="map-section">
          {/* filteredPlaces의 첫 번째 항목을 PlaceMap에 전달 */}
          <PlaceMap selectedPlace={filteredPlaces[0] || null} />
        </div>

        <div className="choose-search-panel">
          {/* ... (기존 UI) */}
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
            {filteredPlaces.map((place) => {
              const isSelected = selectedPlaces.some(p => p.id === place.id);

              return (
                <li
                  key={place.id}
                  className={`place-item ${isSelected ? 'selected' : 'not-selected'}`}
                  onClick={() => handleSelectPlace(place)}
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