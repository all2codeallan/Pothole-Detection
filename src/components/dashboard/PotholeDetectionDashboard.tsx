import React, { useState, useEffect } from 'react';
import { MapContainer } from '../map/MapContainer';
import { SensorPanel } from '../sensors/SensorPanel';
import { PotholePanel } from '../potholes/PotholePanel';
import { ControlPanel } from '../controls/ControlPanel';
import { StatusBar } from '../ui/StatusBar';
import { AlertSystem } from '../ui/AlertSystem';
import { usePotholeStore } from '../../store/potholeStore';
import { Card } from '@/components/ui/card';

export const PotholeDetectionDashboard = () => {
  const { isConnected, demoMode, initializeSystem } = usePotholeStore();
  const [selectedPanel, setSelectedPanel] = useState<'sensors' | 'potholes' | 'analytics'>('sensors');

  useEffect(() => {
    initializeSystem();
  }, [initializeSystem]);

  return (
    <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 h-16 bg-black/30 backdrop-blur-md border-b border-cyan-500/30 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Smart City Pothole Detection</h1>
            <p className="text-xs text-cyan-400">Real-Time IoT Monitoring System</p>
          </div>
        </div>
        <StatusBar />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 h-[calc(100vh-4rem)] flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-black/20 backdrop-blur-md border-r border-cyan-500/30 p-4 space-y-4 overflow-y-auto">
          <ControlPanel />
          
          {/* Panel Selector */}
          <div className="flex bg-black/30 rounded-lg p-1">
            {(['sensors', 'potholes', 'analytics'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setSelectedPanel(panel)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  selectedPanel === panel
                    ? 'bg-cyan-500 text-black'
                    : 'text-cyan-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {panel.charAt(0).toUpperCase() + panel.slice(1)}
              </button>
            ))}
          </div>

          {/* Dynamic Panel Content */}
          <div className="flex-1">
            {selectedPanel === 'sensors' && <SensorPanel />}
            {selectedPanel === 'potholes' && <PotholePanel />}
            {selectedPanel === 'analytics' && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">127</div>
                      <div className="text-xs text-gray-400">Total Potholes</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-400">23</div>
                      <div className="text-xs text-gray-400">Critical</div>
                    </div>
                  </div>
                  <div className="h-32 bg-black/30 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">Analytics Chart</div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer />
        </div>
      </div>

      {/* Alert System */}
      <AlertSystem />
    </div>
  );
};
