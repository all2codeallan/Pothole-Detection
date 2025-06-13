import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';
import { getGoogleMapsApiKey, isGoogleMapsAvailable, darkMapStyle, transformCoordinates, demoScenarios } from '../../utils/googleMapsConfig';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, MapPin, Satellite, Navigation, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
    resetDemo,
    addPothole,
    clearPotholes,
    loggingEnabled,
    setLoggingEnabled
  } = usePotholeStore();
  
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isStreetViewOpen, setIsStreetViewOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('campus');
  const [endPoint, setEndPoint] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [selectingEndPoint, setSelectingEndPoint] = useState(false);
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);
  const [simCarIndex, setSimCarIndex] = useState(0);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [routeReady, setRouteReady] = useState(false);
  const [demoPotholes, setDemoPotholes] = useState<any[]>([]);
  const routePolylineRef = useRef<any>(null);

  // FIX: Move cumulative state declaration here, before any useEffect or function that uses it
  const [cumulative, setCumulative] = useState<{ dists: number[]; total: number } | null>(null);

  // Add local state for demo progress and detected potholes
  const [localDemoProgress, setLocalDemoProgress] = useState(0);
  const [detectedPotholes, setDetectedPotholes] = useState<Set<string>>(new Set());

  // Car SVG icon as a data URL
  const carIcon = {
    url: 'data:image/svg+xml;utf8,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="12" width="20" height="8" rx="4" fill="%2300d4ff" stroke="%23fff" stroke-width="2"/><rect x="12" y="8" width="8" height="8" rx="4" fill="%2300d4ff" stroke="%23fff" stroke-width="2"/></svg>',
    scaledSize: (window.google && window.google.maps && (window.google.maps as any).Size) ? new (window.google.maps as any).Size(32, 32) : undefined,
    anchor: (window.google && window.google.maps && (window.google.maps as any).Point) ? new (window.google.maps as any).Point(16, 16) : undefined,
  };

  // Helper to calculate angle between two LatLngs
  function getAngle(from: google.maps.LatLng, to: google.maps.LatLng) {
    const dy = to.lat() - from.lat();
    const dx = to.lng() - from.lng();
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }

  // Smooth car animation state
  const [carAnim, setCarAnim] = useState({
    progress: 0, // 0 to 1 along the route
    animating: false,
    angle: 0,
  });
  const carAnimRef = useRef(carAnim);
  carAnimRef.current = carAnim;

  // Car animation progress and frame refs
  const carProgressRef = useRef(0);
  const carFrameRef = useRef<number | null>(null);

  // Start smooth animation when demo starts
  useEffect(() => {
    if (!isDemoRunning || routePath.length < 2 || !cumulative) return;
    carProgressRef.current = 0;
    setLocalDemoProgress(0);
    setDetectedPotholes(new Set());
    function animate() {
      if (!isDemoRunning) return;
      carProgressRef.current += 0.0015; // Adjust speed as needed
      if (carProgressRef.current > 1) carProgressRef.current = 1;
      setCarAnim(prev => ({ ...prev, progress: carProgressRef.current, animating: true }));
      setLocalDemoProgress(carProgressRef.current * 100);
      // Mark potholes as detected if car has passed their position along the route
      if (isDemoRunning && demoPotholes.length > 0 && cumulative) {
        const { dists, total } = cumulative;
        const carDist = carProgressRef.current * total;
        setDetectedPotholes(prev => {
          const newSet = new Set(prev);
          demoPotholes.forEach(pothole => {
            // Find the closest point on the route to the pothole
            let minIdx = 0;
            let minDist = Infinity;
            for (let i = 0; i < routePath.length; i++) {
              const dist = google.maps.geometry.spherical.computeDistanceBetween(
                new google.maps.LatLng(pothole.position.lat, pothole.position.lng),
                routePath[i]
              );
              if (dist < minDist) {
                minDist = dist;
                minIdx = i;
              }
            }
            // If car has passed this point, mark as detected
            if (carDist >= dists[minIdx]) {
              newSet.add(pothole.id);
            }
          });
          return newSet;
        });
      }
      if (carProgressRef.current < 1) {
        carFrameRef.current = requestAnimationFrame(animate);
      } else {
        setLocalDemoProgress(100);
        stopDemo();
      }
    }
    carFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (carFrameRef.current) cancelAnimationFrame(carFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoRunning, routePath, cumulative, demoPotholes]);

  // Helper to compute cumulative distances along the route
  function getCumulativeDistances(path: google.maps.LatLng[]) {
    const dists = [0];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += google.maps.geometry.spherical.computeDistanceBetween(path[i - 1], path[i]);
      dists.push(total);
    }
    return { dists, total };
  }

  useEffect(() => {
    if (routePath.length > 1) {
      setCumulative(getCumulativeDistances(routePath));
    } else {
      setCumulative(null);
    }
  }, [routePath]);

  // Calculate car position and angle for smooth animation (distance-based)
  const carPosition = (() => {
    if (!cumulative || !carAnim.animating) return routePath[0];
    const { dists, total } = cumulative;
    const targetDist = carAnim.progress * total;
    // Find the segment where targetDist falls
    let seg = 0;
    while (seg < dists.length - 1 && dists[seg + 1] < targetDist) seg++;
    const from = routePath[seg];
    const to = routePath[Math.min(seg + 1, routePath.length - 1)];
    if (!from || !to) return routePath[0];
    const segDist = dists[seg + 1] - dists[seg];
    const frac = segDist === 0 ? 0 : (targetDist - dists[seg]) / segDist;
    const lat = from.lat() + (to.lat() - from.lat()) * frac;
    const lng = from.lng() + (to.lng() - from.lng()) * frac;
    const angle = getAngle(from, to);
    if (carAnim.angle !== angle) setCarAnim(prev => ({ ...prev, angle }));
    // Debug log
    console.log('Car position:', lat, lng, 'RoutePath:', routePath.map(p => [p.lat(), p.lng()]));
    return new google.maps.LatLng(lat, lng);
  })();

  // Draw the route polyline on the map for visual debugging
  useEffect(() => {
    if (!mapInstance.current) return;
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    if (routePath.length > 1) {
      routePolylineRef.current = new (window.google.maps as any).Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#00d4ff',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstance.current,
      });
    }
  }, [routePath]);

  // Place/animate the car marker
  useEffect(() => {
    if (!mapInstance.current || !carPosition) return;
    console.log('Car position:', carPosition?.lat(), carPosition?.lng(), 'RoutePath:', routePath.map(p => [p.lat(), p.lng()]));
    if (carMarkerRef.current) {
      carMarkerRef.current.setPosition(carPosition);
      (carMarkerRef.current as any).setIcon(carIcon as any);
    } else {
      carMarkerRef.current = new (window.google.maps as any).Marker({
        position: carPosition,
        map: mapInstance.current,
        icon: carIcon as any,
        title: 'RC Car Position',
      });
    }
    mapInstance.current.setCenter(carPosition);
  }, [carPosition, carIcon]);

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

    directionsService.current = new google.maps.DirectionsService();
    directionsRenderer.current = new google.maps.DirectionsRenderer();
    directionsRenderer.current.setMap(mapInstance.current);

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
      carMarkerRef.current = new (window.google.maps as any).Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
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

    // Show only reached potholes during demo, all after demo, all store potholes otherwise
    let potholeList: any[] = [];
    if (isDemoRunning && cumulative && demoPotholes.length > 0) {
      // Only show potholes whose position along the route has been reached by the car
      const { dists, total } = cumulative;
      const carDist = carAnim.progress * total;
      potholeList = demoPotholes.filter(pothole => {
        // Find the closest point on the route to the pothole
        let minIdx = 0;
        let minDist = Infinity;
        for (let i = 0; i < routePath.length; i++) {
          const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(pothole.position.lat, pothole.position.lng),
            routePath[i]
          );
          if (dist < minDist) {
            minDist = dist;
            minIdx = i;
          }
        }
        // Only show if car has reached/passed this point
        return carDist >= dists[minIdx];
      });
    } else if (!isDemoRunning && demoPotholes.length > 0) {
      potholeList = potholes; // After demo, use global potholes
    } else {
      potholeList = potholes;
    }

    potholeList.forEach(pothole => {
      let position;
      if ((isDemoRunning || demoPotholes.length > 0) && demoPotholes.some(p => p.id === pothole.id)) {
        position = new google.maps.LatLng(pothole.position.lat, pothole.position.lng);
      } else if (demoMode) {
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
        high: '#ff4757', // red
        medium: '#ffa502', // orange
        low: '#2ed573' // green
      };
      let markerColor = severityColors[pothole.severity];
      // No detected/green color at any time

      const marker = new google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: `${pothole.severity.toUpperCase()} Pothole`
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style=\"background: #1a1a1a; color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.3);\">
            <h3 style=\"color: #00d4ff; margin: 0 0 8px 0;\">Pothole #${pothole.id.slice(-4)}</h3>
            <div style=\"color: #e5e5e5; font-size: 14px;\">
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
  }, [potholes, demoPotholes, isDemoRunning, demoMode, mapConfig, selectedScenario, detectedPotholes]);

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

  // Handle Start Demo
  const handleStartDemo = () => {
    setSelectingEndPoint(true);
    stopDemo(); // Ensure previous demo is stopped
  };

  // Handle map click for endpoint selection
  useEffect(() => {
    if (!selectingEndPoint || !mapInstance.current) return;
    const map = mapInstance.current;
    const listener = google.maps.event.addListener(map, 'click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        setEndPoint({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        setSelectingEndPoint(false);
        // Start demo immediately after endpoint is selected
        setRouteReady(true); // This will trigger the useEffect to start the demo after route is calculated
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [selectingEndPoint]);

  // Calculate route when endpoint is set
  useEffect(() => {
    if (!endPoint || !mapInstance.current || !directionsService.current || !directionsRenderer.current) return;
    let start: google.maps.LatLng | google.maps.LatLngLiteral = mapInstance.current.getCenter();
    if (carMarkerRef.current && carMarkerRef.current.getPosition()) {
      start = carMarkerRef.current.getPosition()!;
    }
    const request: google.maps.DirectionsRequest = {
      origin: start,
      destination: endPoint,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.current.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.current.setDirections(result);
        const path = result.routes[0].overview_path;
        setRoutePath(path);
        setSimCarIndex(0);
        // Random number of potholes between 3 and 7 (or path.length-2, whichever is smaller)
        const maxPotholes = Math.min(7, path.length - 2);
        const potholeCount = Math.floor(Math.random() * (maxPotholes - 2)) + 3;
        const usedIndices = new Set<number>();
        while (usedIndices.size < potholeCount) {
          const idx = Math.floor(Math.random() * (path.length - 2)) + 1;
          usedIndices.add(idx);
        }
        const indices = Array.from(usedIndices);
        const severities = ['high', 'medium', 'low'];
        const potholes = indices.map((idx, i) => {
          const pos = path[idx];
          // Assign severity randomly
          const severity = severities[Math.floor(Math.random() * severities.length)];
          return {
            id: `demo-pothole-${i}`,
            position: { lat: pos.lat(), lng: pos.lng() },
            severity,
            depth: Math.random() * 8 + 2,
            accelerometer: { x: 0, y: 0, z: 1, magnitude: 2 + Math.random() * 2 },
            timestamp: new Date().toISOString()
          };
        });
        setDemoPotholes(potholes);
        // Do not setRouteReady here
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }, [endPoint]);

  // Filter potholes on the route
  const getPotholeLatLng = (pothole: any) => {
    // If already GPS, return as is
    if (typeof pothole.position.lat === 'number' && typeof pothole.position.lng === 'number') {
      return new google.maps.LatLng(pothole.position.lat, pothole.position.lng);
    }
    // Otherwise, convert using transformCoordinates (fallback)
    if (demoMode) {
      const pos = transformCoordinates.cardboardToGPS(
        pothole.position.x,
        pothole.position.y,
        mapConfig.gpsCenter.lat,
        mapConfig.gpsCenter.lng,
        mapConfig.boardDimensions.width,
        mapConfig.boardDimensions.height
      );
      return new google.maps.LatLng(pos.lat, pos.lng);
    } else {
      const scenario = demoScenarios[selectedScenario as keyof typeof demoScenarios];
      const pos = transformCoordinates.campusMapping(
        pothole.position.x,
        pothole.position.y,
        scenario.center
      );
      return new google.maps.LatLng(pos.lat, pos.lng);
    }
  };
  const potholesOnRoute = isDemoRunning ? demoPotholes : (routePath.length > 0 ? potholes.filter(pothole => {
    return routePath.some(point => {
      const latLng = new google.maps.LatLng(point.lat(), point.lng());
      const potholePosition = getPotholeLatLng(pothole);
      return google.maps.geometry.spherical.computeDistanceBetween(latLng, potholePosition) < 50;
    });
  }) : []);

  // Add a new useEffect to call startDemo when routePath is set and routeReady is true
  useEffect(() => {
    if (routeReady && routePath.length > 0 && demoPotholes.length > 0) {
      setTimeout(() => {
        startDemo();
      }, 0);
      setRouteReady(false);
    }
  }, [routeReady, routePath, demoPotholes]);

  // When demo ends, copy demoPotholes to global potholes array, marking detected ones
  useEffect(() => {
    if (!isDemoRunning && demoPotholes.length > 0) {
      clearPotholes();
      demoPotholes.forEach(p => {
        addPothole({
          ...p,
          position: { lat: p.position.lat, lng: p.position.lng },
          detected: detectedPotholes.has(p.id),
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoRunning, demoPotholes, detectedPotholes]);

  // Replace the reset button handler and add a new function for full reset:
  const handleResetDemo = () => {
    resetDemo();
    setDemoPotholes([]);
    setRoutePath([]);
    setSimCarIndex(0);
    setEndPoint(undefined);
    setDetectedPotholes(new Set());
    setRouteReady(false);
    setCumulative(null);
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

      {/* Logging Toggle (top-right, above demo controls) */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-30">
        <Card className="p-2 flex items-center space-x-2 bg-black/40 backdrop-blur-md border-cyan-500/30 mb-2">
          <span className="text-white text-sm font-medium">Enable Logging</span>
          <Switch checked={loggingEnabled} onCheckedChange={setLoggingEnabled} />
        </Card>
      </div>

      {/* Demo Controls */}
      <div className="absolute top-20 right-4 space-y-2">
        {/* Demo Controls */}
        <div className="flex space-x-2">
          <Button
            onClick={isDemoRunning ? stopDemo : handleStartDemo}
            className={`bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white flex items-center space-x-2 ${selectingEndPoint ? 'bg-gray-600 cursor-not-allowed' : ''}`}
            disabled={selectingEndPoint}
          >
            {selectingEndPoint ? (
              <span>Select Endpoint</span>
            ) : (
              <>
                {isDemoRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isDemoRunning ? 'Stop Demo' : 'Start Demo'}</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={handleResetDemo}
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
                <span className="text-cyan-400 text-sm">{Math.round(localDemoProgress)}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                  style={{ width: `${localDemoProgress}%` }}
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
