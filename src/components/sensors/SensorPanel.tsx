
import React from 'react';
import { Card } from '@/components/ui/card';
import { usePotholeStore } from '../../store/potholeStore';
import { SensorChart } from './SensorChart';

export const SensorPanel = () => {
  const { sensorData, isConnected } = usePotholeStore();

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Sensor Status</h3>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
        </div>
        <div className="text-sm text-gray-400">
          {isConnected ? 'Connected to ThingSpeak' : 'Disconnected'}
        </div>
      </Card>

      {/* Accelerometer */}
      <Card className="p-4">
        <h4 className="text-white font-medium mb-3">Accelerometer (g)</h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-black/30 rounded p-2 text-center">
            <div className="text-cyan-400 font-mono text-lg">{sensorData.accelerometer.x.toFixed(2)}</div>
            <div className="text-xs text-gray-400">X-Axis</div>
          </div>
          <div className="bg-black/30 rounded p-2 text-center">
            <div className="text-purple-400 font-mono text-lg">{sensorData.accelerometer.y.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Y-Axis</div>
          </div>
          <div className="bg-black/30 rounded p-2 text-center">
            <div className="text-orange-400 font-mono text-lg">{sensorData.accelerometer.z.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Z-Axis</div>
          </div>
        </div>
        <SensorChart 
          data={[sensorData.accelerometer.x, sensorData.accelerometer.y, sensorData.accelerometer.z]}
          labels={['X', 'Y', 'Z']}
          colors={['cyan', 'purple', 'orange']}
        />
      </Card>

      {/* Ultrasonic Sensor */}
      <Card className="p-4">
        <h4 className="text-white font-medium mb-3">Surface Distance</h4>
        <div className="bg-black/30 rounded p-3 text-center">
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {sensorData.ultrasonic.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">centimeters</div>
        </div>
        <div className="mt-3 h-2 bg-black/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-300"
            style={{ width: `${Math.min(100, (sensorData.ultrasonic / 30) * 100)}%` }}
          ></div>
        </div>
      </Card>

      {/* GPS Data */}
      <Card className="p-4">
        <h4 className="text-white font-medium mb-3">Position Data</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">X Position:</span>
            <span className="text-white font-mono">{sensorData.position.x.toFixed(1)} cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Y Position:</span>
            <span className="text-white font-mono">{sensorData.position.y.toFixed(1)} cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Speed:</span>
            <span className="text-cyan-400 font-mono">{sensorData.speed.toFixed(1)} cm/s</span>
          </div>
        </div>
      </Card>

      {/* Data Rate */}
      <Card className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Update Rate:</span>
          <span className="text-green-400 font-mono text-sm">10 Hz</span>
        </div>
      </Card>
    </div>
  );
};
