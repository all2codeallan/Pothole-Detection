
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Map, BarChart3 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Auto-redirect to dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/app/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <div className="w-10 h-10 bg-white rounded-lg"></div>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
          Smart City
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Pothole Detection</span>
        </h1>

        <p className="text-xl text-cyan-400 mb-8 max-w-2xl mx-auto">
          Real-Time IoT Monitoring System for Infrastructure Intelligence
        </p>

        <p className="text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Advanced pothole detection using RC car sensors, accelerometer data, and GPS mapping. 
          Experience the future of smart city infrastructure monitoring with our cutting-edge dashboard.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-black/20 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6">
            <LayoutDashboard className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Real-Time Dashboard</h3>
            <p className="text-gray-400 text-sm">Live monitoring of all system metrics and alerts</p>
          </div>
          <div className="bg-black/20 backdrop-blur-md border border-purple-500/30 rounded-lg p-6">
            <Map className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Interactive Mapping</h3>
            <p className="text-gray-400 text-sm">Dual-mode mapping with Google Maps integration</p>
          </div>
          <div className="bg-black/20 backdrop-blur-md border border-orange-500/30 rounded-lg p-6">
            <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-400 text-sm">Comprehensive data analysis and insights</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/app/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-3 text-lg"
          >
            Enter Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/app/map')}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-3 text-lg"
          >
            View Live Map
          </Button>
        </div>

        {/* Auto-redirect notification */}
        <p className="text-gray-500 text-sm mt-8">
          Automatically redirecting to dashboard in 3 seconds...
        </p>
      </div>
    </div>
  );
};

export default Index;
