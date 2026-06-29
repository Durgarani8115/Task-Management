"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Props = {
  activeCount: number;
  completedCount: number;
  urgentCount: number;
};

export function AnalyticsChart({ activeCount, completedCount, urgentCount }: Props) {
  const data = [
    { name: 'Active', value: activeCount, color: '#22c55e' }, // green-500
    { name: 'Completed', value: completedCount, color: '#166534' }, // green-800
    { name: 'Urgent', value: urgentCount, color: '#ef4444' }, // red-500
  ];

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
