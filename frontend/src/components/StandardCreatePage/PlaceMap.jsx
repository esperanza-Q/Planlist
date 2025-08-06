import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 37.5665,
  lng: 126.9780,
};

const PlaceMap = ({ selectedPlace }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // API 받아서 따로 설정 필요
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : center}
      zoom={13}
    >
      {selectedPlace && (
        <Marker
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          title={selectedPlace.name}
        />
      )}
    </GoogleMap>
  );
};

export default React.memo(PlaceMap);
