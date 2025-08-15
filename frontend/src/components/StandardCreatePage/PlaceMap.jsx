// src/components/StandardCreatePage/PlaceMap.jsx
import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 37.5665, 
  lng: 126.9780,
};

const libraries = ['places'];

const PlaceMap = ({ places, hoveredPlace }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCUOHPQ7K-lBjve39kUWwfqOL91BSEMqXI', // Replace with your actual API key
    libraries: libraries,
  });

  // Check if a hovered place exists and has the required coordinates
  const mapCenter = hoveredPlace && hoveredPlace.lat && hoveredPlace.lng
    ? { lat: hoveredPlace.lat, lng: hoveredPlace.lng }
    : center;

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
    >
      {/* Ensure places is an array before mapping */}
      {places && places.map((place, index) => (
        <Marker 
          key={index} // It's better to use a unique ID if available
          position={{ lat: place.lat, lng: place.lng }}
        />
      ))}
      {/*
        Conditionally render a special marker for the hovered place.
        This handles the case where the hovered place might not be in the initial `places` array.
      */}
      {hoveredPlace && (
        <Marker
          position={{ lat: hoveredPlace.lat, lng: hoveredPlace.lng }}
          // You can use a different icon to highlight the hovered place
          // icon={{ url: 'your-custom-hover-icon.png' }}
        />
      )}
    </GoogleMap>
  ) : (
    <div>Loading Map...</div>
  );
};

export default PlaceMap;