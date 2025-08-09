import React, { useState } from 'react';
import LocationIcon from '../../icons/LocationIcon';



const PlaceSelectionPopup = ({ places, onSelect, onClose }) => {
  
  const [activeTab, setActiveTab] = useState('all');
  
  
  return (
    <div className="popup-overlay">
      <div className="planner-popup-box ">
        
        <div className="tab category-tabs place-category-tabs">
            {['all', 'place', 'dining', 'stay'].map(tab => (
              <button
                key={tab}
                className={`category-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                disabled={activeTab === tab}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
        </div>

        <ul className='popup-place-list'>
          {places
            .filter(place => activeTab === 'all' || place.category === activeTab)
            .map(place => (
              <li key={place.id} onClick={() => onSelect(place)}>
                <div className="popup-place-item">
                      <LocationIcon color={"#BAD6EB"} />

                      <div className='popup-place-item-content'>
                        <span className='place-title'>{place.name}</span>
                        <div className="place-address">{place.address}</div>
                          <div className="place-desc">
                            {place.description || 'description about the place......'}
                          </div>

                      </div>
                    


                </div>
                
              </li>
          ))}
        </ul>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PlaceSelectionPopup;
