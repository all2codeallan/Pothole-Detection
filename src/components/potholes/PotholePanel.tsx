import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';
import { Switch } from '@/components/ui/switch';

export const PotholePanel = () => {
  const { potholes, clearPotholes, loggingEnabled, setLoggingEnabled, resetStatistics } = usePotholeStore();
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredPotholes = potholes.filter(p => 
    filter === 'all' || p.severity === filter
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟡';
      default: return '⚪';
    }
  };

  const stats = {
    total: loggingEnabled ? potholes.length : 0,
    high: loggingEnabled ? potholes.filter(p => p.severity === 'high').length : 0,
    medium: loggingEnabled ? potholes.filter(p => p.severity === 'medium').length : 0,
    low: loggingEnabled ? potholes.filter(p => p.severity === 'low').length : 0,
  };

  const getPotholePositionString = (pothole) => {
    if (typeof pothole.position.x === 'number' && typeof pothole.position.y === 'number') {
      return `${pothole.position.x.toFixed(1)}, ${pothole.position.y.toFixed(1)}`;
    } else if (typeof pothole.position.lat === 'number' && typeof pothole.position.lng === 'number') {
      return `${pothole.position.lat.toFixed(5)}, ${pothole.position.lng.toFixed(5)}`;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Logging Controls */}
      <Card className="p-4 flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-white font-medium">Enable Logging</span>
          <Switch checked={loggingEnabled} onCheckedChange={setLoggingEnabled} />
        </div>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold ml-4"
          onClick={resetStatistics}
        >
          Reset Statistics
        </button>
      </Card>
      {/* Statistics */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Detection Summary</h3>
        {!loggingEnabled && (
          <div className="text-gray-400 text-center mb-2">Logging is disabled. No statistics available.</div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-cyan-400">{stats.total}</div>
            <div className="text-xs text-gray-400">Total Detected</div>
          </div>
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{stats.high}</div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{stats.medium}</div>
            <div className="text-xs text-gray-400">Medium</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500/20 to-green-500/20 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{stats.low}</div>
            <div className="text-xs text-gray-400">Low Risk</div>
          </div>
        </div>
      </Card>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex space-x-1 mb-3">
          {(['all', 'high', 'medium', 'low'] as const).map(severity => (
            <button
              key={severity}
              onClick={() => setFilter(severity)}
              className={`flex-1 py-2 px-3 rounded text-xs font-medium transition-all ${
                filter === severity
                  ? 'bg-cyan-500 text-black'
                  : 'text-cyan-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={clearPotholes}
          className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-red-400 hover:text-white transition-all text-sm"
        >
          Clear All Detections
        </button>
      </Card>

      {/* Pothole List */}
      <Card className="p-4">
        <h4 className="text-white font-medium mb-3">Recent Detections</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredPotholes.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              No potholes detected yet
            </div>
          ) : (
            filteredPotholes.map(pothole => (
              <div key={pothole.id} className="bg-black/30 rounded p-3 hover:bg-black/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{getSeverityIcon(pothole.severity)}</span>
                    <span className="text-white text-sm">#{pothole.id.slice(-4)}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(pothole.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Position: {getPotholePositionString(pothole)}</div>
                  <div>Depth: {pothole.depth}cm | Impact: {pothole.accelerometer.magnitude.toFixed(2)}g</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
