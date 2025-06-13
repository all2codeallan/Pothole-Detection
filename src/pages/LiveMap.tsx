
import React, { useEffect } from 'react';
import { EnhancedMapContainer } from '../components/map/EnhancedMapContainer';
import { initializeGoogleMaps } from '../utils/googleMapsLoader';

const LiveMap = () => {
  useEffect(() => {
    // Initialize Google Maps when component mounts
    initializeGoogleMaps();
  }, []);

  return <EnhancedMapContainer />;
};

export default LiveMap;
