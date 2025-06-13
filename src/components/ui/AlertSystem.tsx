
import React from 'react';
import { usePotholeStore } from '../../store/potholeStore';

export const AlertSystem = () => {
  const { alerts, dismissAlert } = usePotholeStore();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg shadow-2xl backdrop-blur-md border transition-all duration-300 transform animate-slide-in-right ${
            alert.type === 'error' ? 'bg-red-500/20 border-red-500/50' :
            alert.type === 'warning' ? 'bg-orange-500/20 border-orange-500/50' :
            alert.type === 'success' ? 'bg-green-500/20 border-green-500/50' :
            'bg-cyan-500/20 border-cyan-500/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className={`font-medium ${
                alert.type === 'error' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-orange-400' :
                alert.type === 'success' ? 'text-green-400' :
                'text-cyan-400'
              }`}>
                {alert.title}
              </div>
              {alert.message && (
                <div className="text-sm text-gray-300 mt-1">
                  {alert.message}
                </div>
              )}
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
