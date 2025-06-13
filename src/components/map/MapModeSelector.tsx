
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MapModeSelectorProps {
  currentMode: 'custom' | 'google' | 'hybrid';
  onModeChange: (mode: 'custom' | 'google' | 'hybrid') => void;
  isGoogleMapsAvailable: boolean;
}

export const MapModeSelector: React.FC<MapModeSelectorProps> = ({
  currentMode,
  onModeChange,
  isGoogleMapsAvailable
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <Card className="p-2 bg-black/40 backdrop-blur-md border-cyan-500/30">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-3 bg-black/40 backdrop-blur-md border-cyan-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium text-sm">Map Mode</h3>
        <Button
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 h-6 w-6 p-0"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={() => onModeChange('custom')}
          className={`w-full px-3 py-2 rounded text-left text-sm transition-all ${
            currentMode === 'custom'
              ? 'bg-cyan-500 text-black font-medium'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          Custom Map
        </button>
        
        <button
          onClick={() => onModeChange('google')}
          disabled={!isGoogleMapsAvailable}
          className={`w-full px-3 py-2 rounded text-left text-sm transition-all ${
            currentMode === 'google'
              ? 'bg-cyan-500 text-black font-medium'
              : isGoogleMapsAvailable
                ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                : 'text-gray-500 cursor-not-allowed'
          }`}
        >
          Google Maps
        </button>
        
        <button
          onClick={() => onModeChange('hybrid')}
          disabled={!isGoogleMapsAvailable}
          className={`w-full px-3 py-2 rounded text-left text-sm transition-all ${
            currentMode === 'hybrid'
              ? 'bg-cyan-500 text-black font-medium'
              : isGoogleMapsAvailable
                ? 'text-gray-300 hover:bg-white/10 hover:text-white'
                : 'text-gray-500 cursor-not-allowed'
          }`}
        >
          Hybrid View
        </button>
      </div>
    </Card>
  );
};
