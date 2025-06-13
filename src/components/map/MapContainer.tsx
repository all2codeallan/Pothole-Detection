
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';
import { RCCarTracker } from './RCCarTracker';
import { PotholeMarkers } from './PotholeMarkers';
import { MapControls } from './MapControls';

export const MapContainer = () => {
  const { demoMode, mapConfig, rcCarPosition } = usePotholeStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="h-full relative overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        <Card className="px-4 py-2 bg-black/40 backdrop-blur-md border-cyan-500/30">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${demoMode ? 'bg-orange-400' : 'bg-cyan-400'} animate-pulse`}></div>
            <span className="text-white font-medium">
              {demoMode ? 'Demo Mode - Cardboard Track' : 'Production Mode - Real World'}
            </span>
          </div>
        </Card>
        <MapControls zoom={zoom} setZoom={setZoom} setPan={setPan} />
      </div>

      {/* Map Canvas */}
      <div
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 cursor-grab active:cursor-grabbing relative overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, cyan 1px, transparent 1px),
              linear-gradient(to bottom, cyan 1px, transparent 1px)
            `,
            backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`
          }}
        ></div>

        {/* Demo Mode - Cardboard Track */}
        {demoMode && (
          <div
            className="absolute bg-gray-700 border-2 border-cyan-400 rounded-lg shadow-2xl"
            style={{
              width: `${200 * zoom}px`,
              height: `${200 * zoom}px`,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {/* Track Surface */}
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg relative overflow-hidden">
              {/* Road Lanes */}
              <div className="absolute inset-4 border-2 border-dashed border-yellow-400 opacity-60 rounded"></div>
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-yellow-400 opacity-60"></div>
              
              {/* Track Label */}
              <div className="absolute top-2 left-2 text-xs text-cyan-400 font-medium">
                Cardboard Track (200x200cm)
              </div>
            </div>
          </div>
        )}

        {/* Production Mode - Street Map Simulation */}
        {!demoMode && (
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: 'center center'
            }}
          >
            {/* Simulated Street Grid */}
            <div className="w-full h-full relative">
              {/* Main Roads */}
              <div className="absolute top-1/3 left-0 right-0 h-12 bg-gray-700 border-y-2 border-yellow-400"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-12 bg-gray-700 border-x-2 border-yellow-400"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-8 bg-gray-600"></div>
              <div className="absolute top-2/3 left-0 right-0 h-8 bg-gray-600"></div>
              
              {/* Buildings */}
              <div className="absolute top-8 left-8 w-24 h-20 bg-slate-600 rounded shadow-lg"></div>
              <div className="absolute top-12 right-8 w-32 h-24 bg-slate-700 rounded shadow-lg"></div>
              <div className="absolute bottom-12 left-12 w-28 h-16 bg-slate-500 rounded shadow-lg"></div>
              
              {/* Parks */}
              <div className="absolute bottom-8 right-12 w-36 h-28 bg-green-800 rounded-full shadow-lg"></div>
            </div>
          </div>
        )}

        {/* RC Car Tracker */}
        <RCCarTracker zoom={zoom} pan={pan} />

        {/* Pothole Markers */}
        <PotholeMarkers zoom={zoom} pan={pan} />

        {/* Real-time Data Overlay */}
        <div className="absolute bottom-4 left-4">
          <Card className="p-3 bg-black/40 backdrop-blur-md border-cyan-500/30">
            <div className="text-xs text-gray-400 mb-1">RC Car Position</div>
            <div className="text-white font-mono">
              X: {rcCarPosition.x.toFixed(1)}cm, Y: {rcCarPosition.y.toFixed(1)}cm
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
