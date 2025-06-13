
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';
import { getGoogleMapsApiKey, isGoogleMapsAvailable, darkMapStyle, transformCoordinates, demoScenarios } from '../../utils/googleMapsConfig';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, MapPin, Satellite, Navigation, Eye } from 'lucide-react';

interface GoogleMapsContainerProps {
  mode: 'simulation' | 'overlay' | 'campus';
}

export const GoogleMapsContainer: React.FC<GoogleMapsContainerProps> = ({ mode }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const carMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const { 
    potholes, 
    rcCarPosition, 
    demoMode, 
    isDemoRunning, 
    demoProgress, 
    mapConfig,
    startDemo,
    stopDemo,
    resetDemo 
  } = usePotholeStore();
  
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('campus');

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsAvailable()) return;

    const scenario = demoScenarios[selectedScenario as keyof typeof demoScenarios];
    const center = demoMode ? mapConfig.gpsCenter : scenario.center;
    
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: demoMode ? 20 : scenario.zoom,
      mapTypeId: mapType,
      styles: darkMapStyle,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy'
    });

    addCustomControls();
  }, [selectedScenario, mapType, demoMode, mapConfig.gpsCenter]);

  // Update RC car position
  useEffect(() => {
    if (!mapInstance.current) return;

    let position;
    if (demoMode) {
      // Use coordinate transformation for demo mode
      position = transformCoordinates.cardboardToGPS(
        rcCarPosition.x, 
        rcCarPosition.y, 
        mapConfig.gpsCenter.lat, 
        mapConfig.gpsCenter.lng,
        mapConfig.boardDimensions.width,
        mapConfig.boardDimensions.height
      );
    } else {
      const scenario = demoScenarios[selectedScenario as keyof typeof demoScenarios];
      position = transformCoordinates.campusMapping(rcCarPosition.x, rcCarPosition.y, scenario.center);
    }

    if (carMarkerRef.current) {
      carMarkerRef.current.setPosition(position);
    } else {
      carMarkerRef.current = new google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#00d4ff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: 'RC Car Position'
      });
    }

    // Center map on car during demo
    if (isDemoRunning) {
      mapInstance.current.setCenter(position);
    }
  }, [rcCarPosition, demoMode, mapConfig, selectedScenario, isDemoRunning]);

  // Update pothole markers
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    potholes.forEach(pothole => {
      let position;
      
      if (demoMode) {
        // Use coordinate transformation for demo mode
        position = transformCoordinates.cardboardToGPS(
          pothole.position.x, 
          pothole.position.y, 
          mapConfig.gpsCenter.lat, 
          mapConfig.gpsCenter.lng,
          mapConfig.boardDimensions.width,
          mapConfig.boardDimensions.height
        );
      } else {
        const scenario = demoScenarios[selectedScenario as keyof typeof demoScenarios];
        position = transformCoordinates.campusMapping(pothole.position.x, pothole.position.y, scenario.center);
      }

      const severityColors = {
        high: '#ff4757',
        medium: '#ffa502',
        low: '#2ed573'
      };

      const marker = new google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: severityColors[pothole.severity],
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: `${pothole.severity.toUpperCase()} Pothole`
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.3);">
            <h3 style="color: #00d4ff; margin: 0 0 8px 0;">Pothole #${pothole.id.slice(-4)}</h3>
            <div style="color: #e5e5e5; font-size: 14px;">
              <div><strong>Severity:</strong> ${pothole.severity.toUpperCase()}</div>
              <div><strong>Depth:</strong> ${pothole.depth.toFixed(1)}cm</div>
              <div><strong>Impact:</strong> ${pothole.accelerometer.magnitude.toFixed(2)}g</div>
              <div><strong>Time:</strong> ${new Date(pothole.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [potholes, demoMode, mapConfig, selectedScenario]);

  const addCustomControls = () => {
    if (!mapInstance.current) return;

    // Zoom controls
    const zoomControlDiv = document.createElement('div');
    zoomControlDiv.innerHTML = `
      <div style="background: rgba(26, 26, 26, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 4px; margin: 10px;">
        <button id="zoom-in" style="display: block; width: 32px; height: 32px; background: none; border: none; color: #ffffff; cursor: pointer; border-radius: 4px;" title="Zoom In">+</button>
        <button id="zoom-out" style="display: block; width: 32px; height: 32px; background: none; border: none; color: #ffffff; cursor: pointer; border-radius: 4px;" title="Zoom Out">−</button>
      </div>
    `;
    
    mapInstance.current.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(zoomControlDiv);

    // Add event listeners
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      const currentZoom = mapInstance.current?.getZoom() || 0;
      mapInstance.current?.setZoom(currentZoom + 1);
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      const currentZoom = mapInstance.current?.getZoom() || 0;
      mapInstance.current?.setZoom(currentZoom - 1);
    });
  };

  const toggleStreetView = () => {
    if (!mapInstance.current || !carMarkerRef.current) return;
    
    const position = carMarkerRef.current.getPosition();
    if (position) {
      const streetView = mapInstance.current.getStreetView();
      streetView.setPosition(position);
      streetView.setVisible(!isStreetViewOpen);
      setIsStreetViewOpen(!isStreetViewOpen);
    }
  };

  if (!isGoogleMapsAvailable()) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <Card className="p-8 bg-black/40 backdrop-blur-md border-cyan-500/30 text-center max-w-md">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Google Maps Integration</h3>
            <p className="text-gray-300">
              Add your Google Maps API key to enable real-world mapping functionality.
            </p>
            <button
              onClick={() => window.location.href = '/setup'}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded-lg font-medium transition-all"
            >
              Setup API Key
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Control Panel */}
      <div className="absolute top-4 left-4 space-y-2">
        {/* Scenario Selector - Only show in non-demo mode */}
        {!demoMode && (
          <Card className="p-3 bg-black/40 backdrop-blur-md border-cyan-500/30">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-transparent text-white border-none outline-none cursor-pointer"
            >
              {Object.entries(demoScenarios).map(([key, scenario]) => (
                <option key={key} value={key} className="bg-gray-800">
                  {scenario.name}
                </option>
              ))}
            </select>
          </Card>
        )}

        {/* Map Type Controls */}
        <Card className="p-2 bg-black/40 backdrop-blur-md border-cyan-500/30">
          <div className="flex space-x-1">
            <button
              onClick={() => setMapType('roadmap')}
              className={`p-2 rounded ${mapType === 'roadmap' ? 'bg-cyan-500 text-black' : 'text-white hover:bg-white/10'}`}
              title="Roadmap"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`p-2 rounded ${mapType === 'satellite' ? 'bg-cyan-500 text-black' : 'text-white hover:bg-white/10'}`}
              title="Satellite"
            >
              <Satellite className="w-4 h-4" />
            </button>
            <button
              onClick={toggleStreetView}
              className={`p-2 rounded ${isStreetViewOpen ? 'bg-cyan-500 text-black' : 'text-white hover:bg-white/10'}`}
              title="Street View"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>

      {/* Demo Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        {/* Demo Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={isDemoRunning ? stopDemo : startDemo}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white flex items-center space-x-2"
          >
            {isDemoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isDemoRunning ? 'Stop Demo' : 'Start Demo'}</span>
          </Button>
          
          <Button
            onClick={resetDemo}
            variant="outline"
            className="border-gray-600 text-gray-400 hover:border-cyan-500/50 hover:text-cyan-400"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Demo Progress */}
        {isDemoRunning && (
          <Card className="p-3 bg-black/40 backdrop-blur-md border-cyan-500/30 min-w-48">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm font-medium">Demo Progress</span>
                <span className="text-cyan-400 text-sm">{Math.round(demoProgress)}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                  style={{ width: `${demoProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">
                Simulating pothole detection...
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-black/40 backdrop-blur-md border-cyan-500/30">
        <h4 className="text-white font-medium mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span className="text-gray-300 text-sm">Severe Pothole</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
            <span className="text-gray-300 text-sm">Moderate Pothole</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            <span className="text-gray-300 text-sm">Minor Pothole</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full border border-white"></div>
            <span className="text-gray-300 text-sm">RC Car</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
