import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePotholeStore } from '../store/potholeStore';
import { Activity, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

const getPotholePositionString = (pothole) => {
  if (typeof pothole.position.x === 'number' && typeof pothole.position.y === 'number') {
    return `${pothole.position.x.toFixed(1)}, ${pothole.position.y.toFixed(1)}`;
  } else if (typeof pothole.position.lat === 'number' && typeof pothole.position.lng === 'number') {
    return `${pothole.position.lat.toFixed(5)}, ${pothole.position.lng.toFixed(5)}`;
  }
  return '';
};

const Dashboard = () => {
  const { isConnected, potholes, loggingEnabled, resetStatistics } = usePotholeStore();
  const statsPotholes = loggingEnabled ? potholes : [];

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
          {loggingEnabled && (
            <button
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm shadow border border-red-700 transition-all"
              onClick={resetStatistics}
            >
              Clear All Stats
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Total Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{loggingEnabled ? potholes.length : 0}</div>
              <p className="text-gray-400 text-sm">All time</p>
            </CardContent>
          </Card>
          <Card className="bg-black/20 border-orange-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{loggingEnabled ? potholes.filter(p => p.severity === 'high').length : 0}</div>
              <p className="text-gray-400 text-sm">High severity</p>
            </CardContent>
          </Card>
          <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Medium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{loggingEnabled ? potholes.filter(p => p.severity === 'medium').length : 0}</div>
              <p className="text-gray-400 text-sm">Medium severity</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md mt-6">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loggingEnabled ? (
                <div className="space-y-4">
                  {statsPotholes.slice(-5).reverse().map((pothole) => (
                    <div key={pothole.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          pothole.severity === 'high' ? 'bg-red-500' :
                          pothole.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium">
                            Position: {getPotholePositionString(pothole)}
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
              ) : (
                <div className="text-gray-400 text-center py-8">Logging is disabled. No recent activity available.</div>
              )}
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
                      {getPotholePositionString(latestPothole)}
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
