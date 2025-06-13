declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        getCenter(): LatLng;
        setZoom(zoom: number): void;
        getZoom(): number;
        setMapTypeId(mapTypeId: MapTypeId | string): void;
        getStreetView(): StreetViewPanorama;
        controls: MVCArray<HTMLElement>[];
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        mapTypeId?: MapTypeId | string;
        styles?: MapTypeStyle[];
        disableDefaultUI?: boolean;
        zoomControl?: boolean;
        mapTypeControl?: boolean;
        scaleControl?: boolean;
        streetViewControl?: boolean;
        rotateControl?: boolean;
        fullscreenControl?: boolean;
        gestureHandling?: string;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        setPosition(latlng: LatLng | LatLngLiteral): void;
        getPosition(): LatLng | undefined;
        setMap(map: Map | null): void;
        addListener(eventName: string, handler: () => void): void;
      }

      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        icon?: Icon | string | Symbol;
        title?: string;
      }

      interface Icon {
        path: SymbolPath | string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      interface Symbol {
        path: SymbolPath | string;
        scale?: number;
        fillColor?: string;
        fillOpacity?: number;
        strokeColor?: string;
        strokeWeight?: number;
      }

      class InfoWindow {
        constructor(opts?: InfoWindowOptions);
        open(map: Map, anchor?: Marker): void;
        setContent(content: string | HTMLElement): void;
      }

      interface InfoWindowOptions {
        content?: string | HTMLElement;
      }

      class StreetViewPanorama {
        setPosition(latlng: LatLng | LatLngLiteral): void;
        setVisible(flag: boolean): void;
      }

      interface MapTypeStyle {
        elementType?: string;
        featureType?: string;
        stylers: MapTypeStyler[];
      }

      interface MapTypeStyler {
        color?: string;
        visibility?: string;
      }

      enum MapTypeId {
        ROADMAP = 'roadmap',
        SATELLITE = 'satellite',
        HYBRID = 'hybrid',
        TERRAIN = 'terrain'
      }

      enum SymbolPath {
        CIRCLE,
        FORWARD_CLOSED_ARROW,
        FORWARD_OPEN_ARROW,
        BACKWARD_CLOSED_ARROW,
        BACKWARD_OPEN_ARROW
      }

      enum ControlPosition {
        RIGHT_BOTTOM,
        LEFT_TOP,
        TOP_CENTER
      }

      class MVCArray<T> {
        push(elem: T): number;
      }

      // --- Directions API Types ---
      class DirectionsService {
        route(
          request: DirectionsRequest,
          callback: (result: DirectionsResult, status: string) => void
        ): void;
      }
      class DirectionsRenderer {
        setMap(map: Map | null): void;
        setDirections(result: DirectionsResult): void;
      }
      interface DirectionsRequest {
        origin: LatLng | LatLngLiteral | string;
        destination: LatLng | LatLngLiteral | string;
        travelMode: string;
      }
      interface DirectionsResult {
        routes: Array<{
          overview_path: LatLng[];
        }>;
      }
      var TravelMode: {
        DRIVING: string;
        WALKING: string;
        BICYCLING: string;
        TRANSIT: string;
      };
      var DirectionsStatus: {
        OK: string;
        NOT_FOUND: string;
        ZERO_RESULTS: string;
        // ...etc
      };
      namespace geometry {
        namespace spherical {
          function computeDistanceBetween(a: LatLng, b: LatLng): number;
        }
      }

      // Add MapMouseEvent type
      class MapMouseEvent {
        latLng: LatLng;
        constructor(latLng: LatLng);
      }

      // Add event namespace for event removal and addListener
      namespace event {
        function removeListener(listener: any): void;
        function addListener(instance: any, eventName: string, handler: Function): any;
      }
    }
  }
}

export {};
