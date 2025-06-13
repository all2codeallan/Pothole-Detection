
import React, { useState } from 'react';
import { usePotholeStore } from '../../store/potholeStore';
import { Card } from '@/components/ui/card';

interface PotholeMarkersProps {
  zoom: number;
  pan: { x: number; y: number };
}

export const PotholeMarkers: React.FC<PotholeMarkersProps> = ({ zoom, pan }) => {
  const { potholes, demoMode } = usePotholeStore();
  const [selectedPothole, setSelectedPothole] = useState<string | null>(null);

  const getPotholePosition = (pothole: any) => {
    if (demoMode) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const trackSize = 200 * zoom;
      
      return {
        x: centerX + pan.x + (pothole.position.x / 200) * trackSize - trackSize / 2,
        y: centerY + pan.y + (pothole.position.y / 200) * trackSize - trackSize / 2
      };
    } else {
      return {
        x: (window.innerWidth / 2) + pan.x + (pothole.position.x * zoom),
        y: (window.innerHeight / 2) + pan.y + (pothole.position.y * zoom)
      };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 border-red-400';
      case 'medium': return 'bg-orange-500 border-orange-400';
      case 'low': return 'bg-yellow-500 border-yellow-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  return (
    <>
      {potholes.map((pothole) => {
        const pos = getPotholePosition(pothole);
        return (
          <div key={pothole.id} className="absolute" style={{ zIndex: 15 }}>
            {/* Pothole Impact Wave */}
            <div
              className="absolute w-8 h-8 border-2 border-red-400 rounded-full animate-ping opacity-75"
              style={{
                left: pos.x - 16,
                top: pos.y - 16,
                animationDuration: '2s'
              }}
            ></div>

            {/* Pothole Marker */}
            <div
              className={`absolute w-4 h-4 rounded-full border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${getSeverityColor(pothole.severity)}`}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => setSelectedPothole(selectedPothole === pothole.id ? null : pothole.id)}
            >
              {/* Severity Indicator */}
              <div className="absolute inset-0 rounded-full animate-pulse"></div>
            </div>

            {/* Pothole Info Popup */}
            {selectedPothole === pothole.id && (
              <div
                className="absolute z-30 transform -translate-x-1/2"
                style={{ left: pos.x, top: pos.y - 100 }}
              >
                <Card className="p-3 bg-black/90 backdrop-blur-md min-w-48 border-cyan-500/30">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-semibold">Pothole #{pothole.id.slice(-4)}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pothole.severity === 'high' ? 'bg-red-500 text-white' :
                        pothole.severity === 'medium' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {pothole.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>Position: {pothole.position.x.toFixed(1)}, {pothole.position.y.toFixed(1)}</div>
                      <div>Depth: {pothole.depth}cm</div>
                      <div>Detected: {new Date(pothole.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="text-xs text-cyan-400">
                      Impact: {pothole.accelerometer.magnitude.toFixed(2)}g
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
