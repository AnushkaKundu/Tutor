import React from 'react';

interface AnswerStatsProps {
  correctlyAnswered: number;
  incorrectlyAnswered: number;
  skipped: number;
}

const AnswerStats: React.FC<AnswerStatsProps> = ({ 
  correctlyAnswered, 
  incorrectlyAnswered, 
  skipped 
}: AnswerStatsProps) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white my-auto">
      
      {/* Correctly Answered */}
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
        <span className="font-medium">Correctly Answered:</span>
        <span className="ml-2 text-gray-400">{correctlyAnswered}</span>
      </div>

      {/* Incorrectly Answered */}
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
        <span className="font-medium">Incorrectly Answered:</span>
        <span className="ml-2 text-gray-400">{incorrectlyAnswered}</span>
      </div>

      {/* Skipped */}
      <div className="flex items-center">
        <div className="w-4 h-4 rounded-full bg-slate-400 mr-2"></div>
        <span className="font-medium">Skipped:</span>
        <span className="ml-2 text-gray-400">{skipped}</span>
      </div>
    </div>
  );
};

export default AnswerStats;