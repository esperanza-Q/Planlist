// // src/components/StandardCreatePage/PlaceMap.jsx
// import React, { useRef, useEffect, useState } from 'react';
// import { GoogleMap } from '@react-google-maps/api';
// import { useMap } from './MapProvider'; // The correct relative path

// const containerStyle = {
//   width: '100%',
//   height: '100%',
// };

// const center = {
//   lat: 37.5665,
//   lng: 126.9780,
// };

// const PlaceMap = ({ selectedPlace, selectedPlaces }) => {
//   const mapRef = useRef(null);
//   const [markers, setMarkers] = useState([]);
//   const { isLoaded } = useMap();

//   useEffect(() => {
//     if (!isLoaded || !mapRef.current || !window.google) return;

//     // Clear previous markers
//     markers.forEach(marker => marker.setMap(null));

//     const newMarkers = [];
//     const { AdvancedMarkerElement } = window.google.maps.marker;

//     // Create markers for all selected places
//     selectedPlaces.forEach(place => {
//       const marker = new AdvancedMarkerElement({
//         map: mapRef.current,
//         position: { lat: place.lat, lng: place.lng },
//         title: place.name,
//       });
//       newMarkers.push(marker);
//     });

//     // Create a special marker for the hovered place
//     if (selectedPlace) {
//       const marker = new AdvancedMarkerElement({
//         map: mapRef.current,
//         position: { lat: selectedPlace.lat, lng: selectedPlace.lng },
//         title: selectedPlace.name,
//       });
//       newMarkers.push(marker);
//     }

//     setMarkers(newMarkers);
    
//     return () => {
//       newMarkers.forEach(marker => marker.setMap(null));
//     };
//   }, [isLoaded, selectedPlaces, selectedPlace]);

//   const getMapCenter = () => {
//     if (selectedPlace) {
//       return { lat: selectedPlace.lat, lng: selectedPlace.lng };
//     }
//     if (selectedPlaces.length > 0) {
//       const latSum = selectedPlaces.reduce((sum, p) => sum + p.lat, 0);
//       const lngSum = selectedPlaces.reduce((sum, p) => sum + p.lng, 0);
//       return {
//         lat: latSum / selectedPlaces.length,
//         lng: lngSum / selectedPlaces.length,
//       };
//     }
//     return center;
//   };

//   const onLoad = (map) => {
//     mapRef.current = map;
//   };

//   if (!isLoaded) {
//     return <div>Loading Map...</div>;
//   }

//   return (
//     <GoogleMap
//       mapContainerStyle={containerStyle}
//       center={getMapCenter()}
//       zoom={13}
//       onLoad={onLoad}
//     />
//   );
// };

// export default React.memo(PlaceMap);