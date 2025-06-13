
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePotholeStore } from '../store/potholeStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Analytics = () => {
  const { potholes } = usePotholeStore();

  // Generate chart data
  const severityData = [
    { name: 'Low', count: potholes.filter(p => p.severity === 'low').length, color: '#FCD34D' },
    { name: 'Medium', count: potholes.filter(p => p.severity === 'medium').length, color: '#F97316' },
    { name: 'High', count: potholes.filter(p => p.severity === 'high').length, color: '#EF4444' }
  ];

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - (23 - hour));
    const count = potholes.filter(p => {
      const potholeTime = new Date(p.timestamp);
      return potholeTime.getHours() === hoursAgo.getHours();
    }).length;
    
    return {
      hour: `${hour}:00`,
      detections: count
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-cyan-400 mt-2">Comprehensive pothole detection analysis</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Severity Distribution */}
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#06B6D4" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Detections */}
          <Card className="bg-black/20 border-purple-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">24-Hour Detection Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="detections" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Average Depth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">
                {potholes.length > 0 ? (potholes.reduce((sum, p) => sum + p.depth, 0) / potholes.length).toFixed(1) : '0'} cm
              </div>
              <p className="text-gray-400 text-sm">Across all detections</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-orange-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Detection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {(potholes.length / Math.max(1, Math.ceil((Date.now() - (potholes[0]?.timestamp ? new Date(potholes[0].timestamp).getTime() : Date.now())) / (1000 * 60 * 60)))).toFixed(1)}
              </div>
              <p className="text-gray-400 text-sm">Potholes per hour</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Coverage Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {((200 * 200) / 10000).toFixed(1)} m²
              </div>
              <p className="text-gray-400 text-sm">Total area monitored</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Detailed Detection Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-cyan-400 pb-2">Time</th>
                    <th className="text-cyan-400 pb-2">Position</th>
                    <th className="text-cyan-400 pb-2">Severity</th>
                    <th className="text-cyan-400 pb-2">Depth</th>
                    <th className="text-cyan-400 pb-2">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {potholes.slice(-10).reverse().map((pothole) => (
                    <tr key={pothole.id} className="border-b border-gray-800">
                      <td className="text-white py-2">{new Date(pothole.timestamp).toLocaleTimeString()}</td>
                      <td className="text-white py-2">{pothole.position.x.toFixed(1)}, {pothole.position.y.toFixed(1)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          pothole.severity === 'high' ? 'bg-red-500 text-white' :
                          pothole.severity === 'medium' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                          {pothole.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-white py-2">{pothole.depth.toFixed(1)} cm</td>
                      <td className="text-white py-2">{pothole.accelerometer.magnitude.toFixed(2)}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
