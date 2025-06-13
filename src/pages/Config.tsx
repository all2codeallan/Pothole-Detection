
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePotholeStore } from '../store/potholeStore';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const Config = () => {
  const { 
    demoMode, 
    setDemoMode, 
    connect, 
    disconnect, 
    isConnected, 
    clearPotholes, 
    mapConfig, 
    updateMapConfig 
  } = usePotholeStore();
  
  const [apiKey, setApiKey] = useState('');
  const [channelId, setChannelId] = useState('');
  const [boardWidth, setBoardWidth] = useState(mapConfig.boardDimensions.width);
  const [boardHeight, setBoardHeight] = useState(mapConfig.boardDimensions.height);
  const [gpsLat, setGpsLat] = useState(mapConfig.gpsCenter.lat);
  const [gpsLng, setGpsLng] = useState(mapConfig.gpsCenter.lng);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  useEffect(() => {
    setBoardWidth(mapConfig.boardDimensions.width);
    setBoardHeight(mapConfig.boardDimensions.height);
    setGpsLat(mapConfig.gpsCenter.lat);
    setGpsLng(mapConfig.gpsCenter.lng);
  }, [mapConfig]);

  const handleSaveCalibration = () => {
    updateMapConfig({
      boardDimensions: { width: boardWidth, height: boardHeight },
      gpsCenter: { lat: gpsLat, lng: gpsLng }
    });
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude);
          setGpsLng(position.coords.longitude);
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Error detecting location:', error);
          setIsDetectingLocation(false);
          alert('Unable to detect location. Please enter coordinates manually.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsDetectingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">System Configuration</h1>
          <p className="text-cyan-400 mt-2">Configure system settings and connections</p>
        </div>

        {/* Mode Selection */}
        <Card className="bg-black/20 border-cyan-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Operating Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDemoMode(true)}
                className={`px-6 py-3 rounded-lg border transition-all ${
                  demoMode
                    ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                    : 'border-gray-600 text-gray-400 hover:border-orange-500/50'
                }`}
              >
                Demo Mode
              </button>
              <button
                onClick={() => setDemoMode(false)}
                className={`px-6 py-3 rounded-lg border transition-all ${
                  !demoMode
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                    : 'border-gray-600 text-gray-400 hover:border-cyan-500/50'
                }`}
              >
                Production Mode
              </button>
            </div>
            <p className="text-gray-400 text-sm">
              {demoMode 
                ? 'Using cardboard track simulation'
                : 'Real-world GPS coordinates and mapping'
              }
            </p>
          </CardContent>
        </Card>

        {/* Connection Settings */}
        <Card className="bg-black/20 border-purple-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">ThingSpeak Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Enter ThingSpeak API key"
              />
            </div>
            <div>
              <label className="block text-cyan-400 text-sm font-medium mb-2">Channel ID</label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                placeholder="Enter channel ID"
              />
            </div>
            <div className="flex space-x-4">
              <Button
                onClick={isConnected ? disconnect : connect}
                className={`${
                  isConnected 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
              <Button
                onClick={clearPotholes}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:border-red-500/50 hover:text-red-400"
              >
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calibration Settings */}
        <Card className="bg-black/20 border-green-500/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Board & GPS Calibration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">Board Width (cm)</label>
                <input
                  type="number"
                  value={boardWidth}
                  onChange={(e) => setBoardWidth(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">Board Height (cm)</label>
                <input
                  type="number"
                  value={boardHeight}
                  onChange={(e) => setBoardHeight(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">GPS Center Position (RC Car Start Position)</h4>
                <Button
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{isDetectingLocation ? 'Detecting...' : 'Detect Location'}</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-2">GPS Center Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsLat}
                    onChange={(e) => setGpsLat(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-medium mb-2">GPS Center Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={gpsLng}
                    onChange={(e) => setGpsLng(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveCalibration}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Calibration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Config;
