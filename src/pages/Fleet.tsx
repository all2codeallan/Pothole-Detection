
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePotholeStore } from '../store/potholeStore';
import { Car, Battery, Signal, MapPin } from 'lucide-react';

const Fleet = () => {
  const { rcCarPosition, sensorData, isConnected } = usePotholeStore();

  // Mock fleet data for demonstration
  const vehicles = [
    {
      id: 'RC-001',
      name: 'Primary Detection Unit',
      status: 'active',
      battery: 85,
      signal: 95,
      position: rcCarPosition,
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'RC-002',
      name: 'Secondary Unit',
      status: 'maintenance',
      battery: 0,
      signal: 0,
      position: { x: 0, y: 0 },
      lastUpdate: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'RC-003',
      name: 'Backup Unit',
      status: 'standby',
      battery: 92,
      signal: 88,
      position: { x: 50, y: 50 },
      lastUpdate: new Date(Date.now() - 300000).toISOString()
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'maintenance': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'standby': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Fleet Management</h1>
          <p className="text-cyan-400 mt-2">Monitor and control detection vehicles</p>
        </div>

        {/* Fleet Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{vehicles.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Active</CardTitle>
              <Signal className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {vehicles.filter(v => v.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-yellow-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">Standby</CardTitle>
              <Battery className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {vehicles.filter(v => v.status === 'standby').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-red-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Maintenance</CardTitle>
              <Car className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {vehicles.filter(v => v.status === 'maintenance').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{vehicle.name}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{vehicle.id}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-white font-medium">{vehicle.battery}%</div>
                      <div className="text-gray-400 text-xs">Battery</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Signal className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-white font-medium">{vehicle.signal}%</div>
                      <div className="text-gray-400 text-xs">Signal</div>
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-white font-medium">
                      {vehicle.position.x.toFixed(1)}, {vehicle.position.y.toFixed(1)}
                    </div>
                    <div className="text-gray-400 text-xs">Current Position</div>
                  </div>
                </div>

                {/* Last Update */}
                <div className="text-gray-400 text-xs">
                  Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                </div>

                {/* Actions */}
                {vehicle.status === 'active' && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-green-400 text-sm font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      Live Tracking Active
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fleet;
