import { create } from 'zustand';

interface Position {
  x: number;
  y: number;
}

interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

interface SensorData {
  position: Position;
  accelerometer: AccelerometerData;
  ultrasonic: number;
  speed: number;
  timestamp: string;
}

interface Pothole {
  id: string;
  position: Position;
  severity: 'low' | 'medium' | 'high';
  depth: number;
  accelerometer: AccelerometerData;
  timestamp: string;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message?: string;
  timestamp: string;
}

interface MapConfig {
  boardDimensions: { width: number; height: number };
  gpsCenter: { lat: number; lng: number };
  calibrationPoints: Array<{
    physical: Position;
    gps: { lat: number; lng: number };
  }>;
}

interface PotholeStore {
  // State
  isConnected: boolean;
  isDetecting: boolean;
  demoMode: boolean;
  isDemoRunning: boolean;
  demoProgress: number;
  sensorData: SensorData;
  potholes: Pothole[];
  alerts: Alert[];
  rcCarPosition: Position;
  carTrail: Position[];
  mapConfig: MapConfig;
  loggingEnabled: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;
  setDemoMode: (mode: boolean) => void;
  startDetection: () => void;
  stopDetection: () => void;
  addPothole: (pothole: Pothole) => void;
  clearPotholes: () => void;
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  updateSensorData: (data: Partial<SensorData>) => void;
  updateMapConfig: (config: Partial<MapConfig>) => void;
  startDemo: () => void;
  stopDemo: () => void;
  resetDemo: () => void;
  initializeSystem: () => void;
  setLoggingEnabled: (enabled: boolean) => void;
  resetStatistics: () => void;
}

export const usePotholeStore = create<PotholeStore>((set, get) => ({
  // Initial State
  isConnected: false,
  isDetecting: false,
  demoMode: true,
  isDemoRunning: false,
  demoProgress: 0,
  sensorData: {
    position: { x: 100, y: 100 },
    accelerometer: { x: 0, y: 0, z: 1, magnitude: 1 },
    ultrasonic: 15.5,
    speed: 0,
    timestamp: new Date().toISOString(),
  },
  potholes: [],
  alerts: [],
  rcCarPosition: { x: 100, y: 100 },
  carTrail: [],
  mapConfig: {
    boardDimensions: { width: 200, height: 200 },
    gpsCenter: { lat: 12.9716, lng: 77.5946 },
    calibrationPoints: [],
  },
  loggingEnabled: true,

  // Actions
  connect: () => {
    set({ isConnected: true });
    setTimeout(() => get().addAlert({
      type: 'success',
      title: 'Connected to ThingSpeak',
      message: 'Real-time data streaming active'
    }), 0);
  },

  disconnect: () => {
    set({ isConnected: false, isDetecting: false });
    setTimeout(() => get().addAlert({
      type: 'info',
      title: 'Disconnected from ThingSpeak',
      message: 'Data streaming stopped'
    }), 0);
  },

  setDemoMode: (mode: boolean) => {
    set({ demoMode: mode });
    setTimeout(() => get().addAlert({
      type: 'info',
      title: `Switched to ${mode ? 'Demo' : 'Production'} Mode`,
      message: mode ? 'Using cardboard track simulation' : 'Real-world mapping active'
    }), 0);
  },

  startDetection: () => {
    if (get().isConnected) {
      set({ isDetecting: true });
      setTimeout(() => get().addAlert({
        type: 'success',
        title: 'Detection Started',
        message: 'Monitoring for potholes...'
      }), 0);
    }
  },

  stopDetection: () => {
    set({ isDetecting: false });
    setTimeout(() => get().addAlert({
      type: 'info',
      title: 'Detection Stopped',
      message: 'Monitoring paused'
    }), 0);
  },

  addPothole: (pothole: Pothole) => {
    if (!get().loggingEnabled) return;
    set(state => ({
      potholes: [...state.potholes, pothole]
    }));
    setTimeout(() => get().addAlert({
      type: 'warning',
      title: `${pothole.severity.toUpperCase()} Severity Pothole Detected`,
      message: `Position: ${getPotholePositionString(pothole.position)}`
    }), 0);
  },

  clearPotholes: () => {
    set({ potholes: [] });
    setTimeout(() => get().addAlert({
      type: 'info',
      title: 'All Potholes Cleared',
      message: 'Detection history reset'
    }), 0);
  },

  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    
    set(state => ({
      alerts: [...state.alerts, newAlert]
    }));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      get().dismissAlert(newAlert.id);
    }, 5000);
  },

  dismissAlert: (id: string) => {
    set(state => ({
      alerts: state.alerts.filter(alert => alert.id !== id)
    }));
  },

  updateSensorData: (data: Partial<SensorData>) => {
    set(state => ({
      sensorData: { ...state.sensorData, ...data },
      rcCarPosition: data.position || state.rcCarPosition,
      carTrail: data.position ? 
        [...state.carTrail.slice(-20), data.position] : 
        state.carTrail
    }));
  },

  updateMapConfig: (config: Partial<MapConfig>) => {
    set(state => ({
      mapConfig: { ...state.mapConfig, ...config }
    }));
  },

  startDemo: () => {
    set({ isDemoRunning: true, demoProgress: 0 });
    get().clearPotholes();
    
    const demoInterval = setInterval(() => {
      const state = get();
      if (!state.isDemoRunning) {
        clearInterval(demoInterval);
        return;
      }

      const newProgress = state.demoProgress + (100 / 90); // 90 second demo
      
      if (newProgress >= 100) {
        set({ demoProgress: 100, isDemoRunning: false });
        clearInterval(demoInterval);
        setTimeout(() => get().addAlert({
          type: 'success',
          title: 'Demo Completed',
          message: 'Demo simulation finished successfully'
        }), 0);
        return;
      }

      // Simulate car movement
      const boardWidth = state.mapConfig.boardDimensions.width;
      const boardHeight = state.mapConfig.boardDimensions.height;
      
      const newPos = {
        x: Math.max(10, Math.min(boardWidth - 10, state.rcCarPosition.x + (Math.random() - 0.5) * 15)),
        y: Math.max(10, Math.min(boardHeight - 10, state.rcCarPosition.y + (Math.random() - 0.5) * 15))
      };

      // Generate pothole every few seconds
      if (Math.random() < 0.05) {
        const accelerometer = {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4,
          z: 1 + (Math.random() - 0.5) * 0.8,
          magnitude: 0
        };
        accelerometer.magnitude = Math.sqrt(
          accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
        );

        const severity = accelerometer.magnitude > 3.5 ? 'high' : 
                        accelerometer.magnitude > 2.8 ? 'medium' : 'low';
        
        get().addPothole({
          id: Math.random().toString(36).substr(2, 9),
          position: newPos,
          severity,
          depth: Math.random() * 8 + 2,
          accelerometer,
          timestamp: new Date().toISOString()
        });
      }

      get().updateSensorData({
        position: newPos,
        timestamp: new Date().toISOString()
      });

      set({ demoProgress: newProgress });
    }, 1000);
  },

  stopDemo: () => {
    set({ isDemoRunning: false });
  },

  resetDemo: () => {
    set({ 
      isDemoRunning: false, 
      demoProgress: 0, 
      rcCarPosition: { x: 100, y: 100 },
      carTrail: [] 
    });
    get().clearPotholes();
  },

  initializeSystem: () => {
    // Simulate real-time data updates when not in demo mode
    const simulateData = () => {
      const state = get();
      if (!state.isConnected || !state.isDetecting || state.isDemoRunning) return;

      // Simulate RC car movement
      const currentPos = state.rcCarPosition;
      const newPos = {
        x: Math.max(10, Math.min(190, currentPos.x + (Math.random() - 0.5) * 10)),
        y: Math.max(10, Math.min(190, currentPos.y + (Math.random() - 0.5) * 10))
      };

      // Simulate sensor readings
      const accelerometer = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 1 + (Math.random() - 0.5) * 0.5,
        magnitude: 0
      };
      accelerometer.magnitude = Math.sqrt(
        accelerometer.x ** 2 + accelerometer.y ** 2 + accelerometer.z ** 2
      );

      // Detect potholes based on accelerometer magnitude
      if (accelerometer.magnitude > 2.5 && Math.random() < 0.1) {
        const severity = accelerometer.magnitude > 3.5 ? 'high' : 
                        accelerometer.magnitude > 3 ? 'medium' : 'low';
        
        state.addPothole({
          id: Math.random().toString(36).substr(2, 9),
          position: newPos,
          severity,
          depth: Math.random() * 10 + 2,
          accelerometer,
          timestamp: new Date().toISOString()
        });
      }

      state.updateSensorData({
        position: newPos,
        accelerometer,
        ultrasonic: 15 + Math.random() * 10,
        speed: Math.random() * 20 + 5,
        timestamp: new Date().toISOString()
      });
    };

    // Start simulation interval
    setInterval(simulateData, 100); // 10 Hz update rate
  },

  setLoggingEnabled: (enabled: boolean) => set({ loggingEnabled: enabled }),

  resetStatistics: () => {
    set({ potholes: [] });
  },
}));

function getPotholePositionString(position: any): string {
  if (typeof position.x === 'number' && typeof position.y === 'number') {
    return `${position.x.toFixed(1)}, ${position.y.toFixed(1)}`;
  } else if (typeof position.lat === 'number' && typeof position.lng === 'number') {
    return `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
  }
  return '';
}
