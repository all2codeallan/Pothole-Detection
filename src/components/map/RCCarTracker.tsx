
import React from 'react';
import { usePotholeStore } from '../../store/potholeStore';

interface RCCarTrackerProps {
  zoom: number;
  pan: { x: number; y: number };
}

export const RCCarTracker: React.FC<RCCarTrackerProps> = ({ zoom, pan }) => {
  const { rcCarPosition, demoMode, carTrail } = usePotholeStore();

  const getCarPosition = () => {
    if (demoMode) {
      // Convert cm to pixels for demo mode (200cm = 200px at zoom 1)
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const trackSize = 200 * zoom;
      
      return {
        x: centerX + pan.x + (rcCarPosition.x / 200) * trackSize - trackSize / 2,
        y: centerY + pan.y + (rcCarPosition.y / 200) * trackSize - trackSize / 2
      };
    } else {
      // Production mode positioning
      return {
        x: (window.innerWidth / 2) + pan.x + (rcCarPosition.x * zoom),
        y: (window.innerHeight / 2) + pan.y + (rcCarPosition.y * zoom)
      };
    }
  };

  const carPos = getCarPosition();

  return (
    <>
      {/* Car Trail */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {carTrail.length > 1 && (
          <path
            d={`M ${carTrail.map(point => {
              const trailPos = demoMode 
                ? {
                    x: (window.innerWidth / 2) + pan.x + (point.x / 200) * (200 * zoom) - (200 * zoom) / 2,
                    y: (window.innerHeight / 2) + pan.y + (point.y / 200) * (200 * zoom) - (200 * zoom) / 2
                  }
                : {
                    x: (window.innerWidth / 2) + pan.x + (point.x * zoom),
                    y: (window.innerHeight / 2) + pan.y + (point.y * zoom)
                  };
              return `${trailPos.x},${trailPos.y}`;
            }).join(' L ')}`}
            stroke="url(#trailGradient)"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
          />
        )}
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="cyan" stopOpacity="0.5" />
            <stop offset="100%" stopColor="cyan" />
          </linearGradient>
        </defs>
      </svg>

      {/* RC Car */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
        style={{
          left: carPos.x,
          top: carPos.y,
          zIndex: 20
        }}
      >
        {/* Car Shadow */}
        <div className="absolute inset-0 bg-black rounded-lg blur-sm opacity-50 transform translate-x-1 translate-y-1"></div>
        
        {/* Car Body */}
        <div className="relative w-8 h-12 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-lg border-2 border-cyan-300 shadow-lg">
          {/* Car Details */}
          <div className="absolute top-1 left-1 right-1 h-2 bg-black rounded opacity-80"></div>
          <div className="absolute bottom-1 left-1 right-1 h-1 bg-red-500 rounded"></div>
          
          {/* Sensor Indicators */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Detection Range */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-cyan-400 rounded-full opacity-30 animate-ping"></div>
      </div>
    </>
  );
};
