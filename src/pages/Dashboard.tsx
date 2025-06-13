
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePotholeStore } from '../store/potholeStore';
import { Activity, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { potholes, isConnected } = usePotholeStore();

  const totalPotholes = potholes.length;
  const severePotholes = potholes.filter(p => p.severity === 'high').length;
  const moderatePotholes = potholes.filter(p => p.severity === 'medium').length;
  const mildPotholes = potholes.filter(p => p.severity === 'low').length;

  // Get the latest pothole for display
  const latestPothole = potholes.length > 0 ? potholes[potholes.length - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Smart City Dashboard</h1>
            <p className="text-cyan-400 mt-2">Real-time pothole detection and monitoring</p>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isConnected ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
          }`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-white font-medium">
              {isConnected ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-400">Total Potholes</CardTitle>
              <MapPin className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPotholes}</div>
              <p className="text-xs text-gray-400">Detected today</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-red-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Severe</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{severePotholes}</div>
              <p className="text-xs text-gray-400">Require immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-orange-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">Moderate</CardTitle>
              <Activity className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{moderatePotholes}</div>
              <p className="text-xs text-gray-400">Schedule maintenance</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Mild</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mildPotholes}</div>
              <p className="text-xs text-gray-400">Monitor condition</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Detections */}
          <Card className="lg:col-span-2 bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Recent Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {potholes.slice(-5).reverse().map((pothole) => (
                  <div key={pothole.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        pothole.severity === 'high' ? 'bg-red-500' :
                        pothole.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">
                          Position: {pothole.position.x.toFixed(1)}, {pothole.position.y.toFixed(1)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {new Date(pothole.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{pothole.severity.toUpperCase()}</div>
                      <div className="text-gray-400 text-sm">{pothole.depth.toFixed(1)}cm deep</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-black/20 border-purple-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Latest Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestPothole ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pothole Position</span>
                    <span className="text-white font-mono text-sm">
                      {latestPothole.position.x.toFixed(1)}, {latestPothole.position.y.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pothole Depth</span>
                    <span className="text-white font-mono">{latestPothole.depth.toFixed(1)} cm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Severity</span>
                    <span className={`font-mono ${
                      latestPothole.severity === 'high' ? 'text-red-400' :
                      latestPothole.severity === 'medium' ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      {latestPothole.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Detection Time</span>
                    <span className="text-white font-mono text-sm">
                      {new Date(latestPothole.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No potholes detected yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
