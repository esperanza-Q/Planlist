import React, { createContext, useContext, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContext = createContext(null);

export const useMap = () => {
  return useContext(MapContext);
};

const libraries = ['marker', 'places']; // Include all libraries your app needs

export const MapProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCUOHPQ7K-lBjve39kUWwfqOL91BSEMqXI',
    version: 'beta',
    libraries,
  });

  const value = useMemo(() => ({
    isLoaded,
    loadError,
  }), [isLoaded, loadError]);

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};