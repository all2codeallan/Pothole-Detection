
import React from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';

export const ControlPanel = () => {
  const { 
    demoMode, 
    setDemoMode, 
    isConnected, 
    connect, 
    disconnect,
    isDetecting,
    startDetection,
    stopDetection
  } = usePotholeStore();

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">System Mode</h3>
        <div className="flex bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setDemoMode(true)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              demoMode
                ? 'bg-orange-500 text-black'
                : 'text-orange-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => setDemoMode(false)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              !demoMode
                ? 'bg-cyan-500 text-black'
                : 'text-cyan-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Production
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {demoMode 
            ? 'Using cardboard track simulation'
            : 'Real-world street mapping mode'
          }
        </div>
      </Card>

      {/* Connection Control */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Connection</h3>
        <button
          onClick={isConnected ? disconnect : connect}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            isConnected
              ? 'bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 hover:text-white'
              : 'bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 text-green-400 hover:text-white'
          }`}
        >
          {isConnected ? 'Disconnect from ThingSpeak' : 'Connect to ThingSpeak'}
        </button>
        <div className="mt-2 text-xs text-gray-400 text-center">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </Card>

      {/* Detection Control */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Detection</h3>
        <button
          onClick={isDetecting ? stopDetection : startDetection}
          disabled={!isConnected}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            !isConnected
              ? 'bg-gray-500/20 border border-gray-500/50 text-gray-500 cursor-not-allowed'
              : isDetecting
              ? 'bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 hover:text-white'
              : 'bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-400 hover:text-white'
          }`}
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </button>
        <div className="mt-2 flex items-center justify-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isDetecting ? 'Actively detecting' : 'Detection stopped'}
          </span>
        </div>
      </Card>

      {/* System Info */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">System Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Update Rate:</span>
            <span className="text-green-400">10 Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Detection Algorithm:</span>
            <span className="text-cyan-400">AI-Enhanced</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Precision:</span>
            <span className="text-purple-400">±1cm</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
