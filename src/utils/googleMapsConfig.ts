
// Google Maps configuration and styling
export const getGoogleMapsApiKey = (): string => {
  // Try environment variable first
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (envKey) return envKey;
  
  // Fall back to localStorage
  const localKey = localStorage.getItem('googleMapsApiKey');
  if (localKey) return localKey;
  
  // Hardcoded API key as fallback
  return null;
};

export const isGoogleMapsAvailable = (): boolean => {
  return !!getGoogleMapsApiKey() && typeof window !== 'undefined' && typeof window.google !== 'undefined';
};

// Dark theme map styling
export const darkMapStyle: google.maps.MapTypeStyle[] = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#1a1a1a"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#e5e5e5"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#1a1a1a"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#4a4a4a"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#b3b3b3"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#2d2d2d"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#b3b3b3"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#3a3a3a"}]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#e5e5e5"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{"color": "#4a4a4a"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#5a5a5a"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{"color": "#2d2d2d"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#0f1419"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#00d4ff"}]
  }
];

// Coordinate transformation utilities
export const transformCoordinates = {
  // Mode 1: Direct simulation (cardboard to GPS)
  cardboardToGPS: (x: number, y: number, centerLat = 12.9716, centerLng = 77.5946, boardWidth = 200, boardHeight = 200) => {
    // Scale: 1cm = ~10 meters in real world
    const metersPerCm = 10;
    const scale = 111000; // meters per degree at equator
    
    const deltaLat = (y - boardHeight/2) * metersPerCm / scale;
    const deltaLng = (x - boardWidth/2) * metersPerCm / (scale * Math.cos(centerLat * Math.PI / 180));
    
    return {
      lat: centerLat + deltaLat,
      lng: centerLng + deltaLng
    };
  },
  
  // Mode 2: Area overlay (map cardboard to real street)
  overlayToStreet: (x: number, y: number, bounds: any) => {
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    const lat = sw.lat() + (y / 200) * (ne.lat() - sw.lat());
    const lng = sw.lng() + (x / 200) * (ne.lng() - sw.lng());
    
    return { lat, lng };
  },
  
  // Mode 3: Campus mapping (exact venue coordinates)
  campusMapping: (x: number, y: number, campusCenter: {lat: number, lng: number}, boardWidth = 200, boardHeight = 200) => {
    // Map board to ~100m campus area
    const scale = 111000; // meters per degree
    const areaSize = 100; // 100 meters
    
    const deltaLat = ((y - boardHeight/2) / (boardHeight/2)) * (areaSize / scale);
    const deltaLng = ((x - boardWidth/2) / (boardWidth/2)) * (areaSize / (scale * Math.cos(campusCenter.lat * Math.PI / 180)));
    
    return {
      lat: campusCenter.lat + deltaLat,
      lng: campusCenter.lng + deltaLng
    };
  }
};

// Demo scenarios configuration
export const demoScenarios = {
  campus: {
    name: "Campus Demo",
    center: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
    zoom: 18,
    description: "University campus pothole monitoring"
  },
  
  cityStreet: {
    name: "MG Road, Bangalore",
    center: { lat: 12.9758, lng: 77.6081 },
    zoom: 17,
    description: "City street infrastructure monitoring"
  },
  
  constructionZone: {
    name: "Construction Zone",
    center: { lat: 12.9698, lng: 77.7500 },
    zoom: 16,
    description: "Active construction site monitoring"
  }
};
