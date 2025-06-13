
import { getGoogleMapsApiKey } from './googleMapsConfig';

let isLoading = false;
let isLoaded = false;

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (isLoaded || (typeof window !== 'undefined' && window.google?.maps)) {
      resolve();
      return;
    }

    // Currently loading
    if (isLoading) {
      const checkLoaded = () => {
        if (typeof window !== 'undefined' && window.google?.maps) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    isLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback
    if (typeof window !== 'undefined') {
      window.initGoogleMaps = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };
    }

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

// Auto-load on component mount if API key is available
export const initializeGoogleMaps = async () => {
  try {
    await loadGoogleMapsScript();
    console.log('Google Maps loaded successfully');
  } catch (error) {
    console.warn('Google Maps not available:', error);
  }
};
