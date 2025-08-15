import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 37.5665,
  lng: 126.9780, // 서울 시청 중심 좌표
};

const PlaceMap = ({ selectedPlaces }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCUOHPQ7K-lBjve39kUWwfqOL91BSEMqXI', // API 키를 여기에 입력하세요.
  });

  const [map, setMap] = useState(null);

  // 지도가 로드되면 `map` 상태에 인스턴스를 저장합니다.
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // `selectedPlaces`가 변경될 때마다 지도를 부드럽게 이동시킵니다.
  useEffect(() => {
    if (map && selectedPlaces && selectedPlaces.length > 0) {
      // 선택된 장소가 여러 개일 경우, 첫 번째 장소로 지도를 이동시킵니다.
      const firstPlace = selectedPlaces[0];
      map.panTo({ lat: firstPlace.lat, lng: firstPlace.lng });
      map.setZoom(15);
    } else if (map && (!selectedPlaces || selectedPlaces.length === 0)) {
      // 선택된 장소가 없으면 지도를 초기 상태로 되돌립니다.
      map.panTo(center);
      map.setZoom(13);
    }
  }, [map, selectedPlaces]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={selectedPlaces && selectedPlaces.length > 0 ? { lat: selectedPlaces[0].lat, lng: selectedPlaces[0].lng } : center}
      zoom={13}
      onLoad={onLoad}
    >
      {/* 선택된 모든 장소에 대해 마커를 생성합니다. */}
      {selectedPlaces && selectedPlaces.map((place) => (
        <Marker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
        />
      ))}
    </GoogleMap>
  );
};

export default React.memo(PlaceMap);