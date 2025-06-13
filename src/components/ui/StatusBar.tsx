
import React from 'react';
import { usePotholeStore } from '../../store/potholeStore';

export const StatusBar = () => {
  const { isConnected, isDetecting, sensorData } = usePotholeStore();

  return (
    <div className="flex items-center space-x-6">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        <span className="text-sm text-gray-300">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Detection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-cyan-400' : 'bg-gray-500'} ${isDetecting ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm text-gray-300">
          {isDetecting ? 'Detecting' : 'Idle'}
        </span>
      </div>

      {/* Signal Strength */}
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-1 bg-cyan-400 ${
                isConnected && i <= 3 ? 'opacity-100' : 'opacity-30'
              }`}
              style={{ height: `${i * 3 + 6}px` }}
            ></div>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-2">Signal</span>
      </div>

      {/* Current Time */}
      <div className="text-sm text-gray-300 font-mono">
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
