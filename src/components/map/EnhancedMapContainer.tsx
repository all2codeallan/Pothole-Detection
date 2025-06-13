
import React, { useState } from 'react';
import { MapContainer } from './MapContainer';
import { GoogleMapsContainer } from './GoogleMapsContainer';
import { MapModeSelector } from './MapModeSelector';
import { isGoogleMapsAvailable } from '../../utils/googleMapsConfig';

export const EnhancedMapContainer = () => {
  const [mapMode, setMapMode] = useState<'custom' | 'google' | 'hybrid'>('custom');
  const googleMapsReady = isGoogleMapsAvailable();

  return (
    <div className="h-full relative">
      {/* Map Mode Selector */}
      <div className="absolute top-4 left-4 z-30">
        <MapModeSelector
          currentMode={mapMode}
          onModeChange={setMapMode}
          isGoogleMapsAvailable={googleMapsReady}
        />
      </div>

      {/* Map Content */}
      <div className="w-full h-full">
        {mapMode === 'custom' && <MapContainer />}
        {mapMode === 'google' && googleMapsReady && (
          <GoogleMapsContainer mode="simulation" />
        )}
        {mapMode === 'hybrid' && googleMapsReady && (
          <div className="w-full h-full flex">
            <div className="w-1/2 h-full">
              <MapContainer />
            </div>
            <div className="w-1/2 h-full">
              <GoogleMapsContainer mode="simulation" />
            </div>
          </div>
        )}
        {(mapMode === 'google' || mapMode === 'hybrid') && !googleMapsReady && (
          <MapContainer />
        )}
      </div>
    </div>
  );
};
