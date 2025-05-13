'use client'

import React from 'react';

interface MaturityData {
  category: string;
  score: number;
  maxScore: number;
  color: string;
}

interface MaturityChartProps {
  data: MaturityData[];
}

export default function MaturityChart({ data }: MaturityChartProps) {
  return (
    <div className="w-full space-y-6">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
            <span className="text-gray-600 dark:text-gray-400">{item.score.toFixed(1)}/{item.maxScore.toFixed(1)}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`${item.color} h-2.5 rounded-full`} 
              style={{ width: `${(item.score / item.maxScore) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Exploring</span>
            <span>Experimenting</span>
            <span>Implementing</span>
            <span>Transforming</span>
          </div>
        </div>
      ))}
    </div>
  );
}