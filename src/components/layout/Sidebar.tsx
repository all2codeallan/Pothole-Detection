
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Settings, Car } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/map', icon: Map, label: 'Live Map' },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/fleet', icon: Car, label: 'Fleet' },
    { path: '/app/config', icon: Settings, label: 'Config' }
  ];

  return (
    <div className="w-64 bg-black/30 backdrop-blur-md border-r border-cyan-500/30 h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Smart City</h2>
            <p className="text-xs text-cyan-400">Pothole Detection</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
