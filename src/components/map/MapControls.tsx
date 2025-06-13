
import React from 'react';
import { Card } from '@/components/ui/card';

interface MapControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({ zoom, setZoom, setPan }) => {
  const handleZoomIn = () => setZoom(Math.min(3, zoom + 0.2));
  const handleZoomOut = () => setZoom(Math.max(0.5, zoom - 0.2));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className="flex flex-col space-y-2 p-2 bg-black/40 backdrop-blur-md border-cyan-500/30">
      <button
        onClick={handleZoomIn}
        className="w-10 h-10 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-lg text-cyan-400 hover:text-white transition-all flex items-center justify-center"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        className="w-10 h-10 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-lg text-cyan-400 hover:text-white transition-all flex items-center justify-center"
      >
        -
      </button>
      <button
        onClick={handleReset}
        className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 rounded-lg text-purple-400 hover:text-white transition-all flex items-center justify-center text-xs"
      >
        ⌂
      </button>
      <div className="text-xs text-center text-gray-400 py-1">
        {(zoom * 100).toFixed(0)}%
      </div>
    </Card>
  );
};
