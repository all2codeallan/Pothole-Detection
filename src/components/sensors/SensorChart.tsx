
import React from 'react';

interface SensorChartProps {
  data: number[];
  labels: string[];
  colors: string[];
}

export const SensorChart: React.FC<SensorChartProps> = ({ data, labels, colors }) => {
  const maxValue = Math.max(...data.map(Math.abs), 1);
  
  return (
    <div className="h-16 flex items-end space-x-1">
      {data.map((value, index) => {
        const height = (Math.abs(value) / maxValue) * 100;
        const colorClass = colors[index] === 'cyan' ? 'bg-cyan-400' : 
                          colors[index] === 'purple' ? 'bg-purple-400' : 'bg-orange-400';
        
        return (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full ${colorClass} rounded-t transition-all duration-300`}
              style={{ height: `${height}%` }}
            ></div>
            <div className="text-xs text-gray-400 mt-1">{labels[index]}</div>
          </div>
        );
      })}
    </div>
  );
};
