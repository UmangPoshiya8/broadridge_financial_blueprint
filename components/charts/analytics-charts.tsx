'use client';

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Legend } from 'recharts';

export function TradeVolumeChart({ data }: { data: Array<{ day: string; volume: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="volume" fill="#1d4ed8" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VotingResultsChart({ data }: { data: Array<{ question: string; yes: number; no: number; abstain: number }> }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="question" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="yes" stackId="a" fill="#16a34a" />
          <Bar dataKey="no" stackId="a" fill="#dc2626" />
          <Bar dataKey="abstain" stackId="a" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieAnalyticsChart({
  data,
  nameKey,
  valueKey
}: {
  data: Array<Record<string, string | number>>;
  nameKey: string;
  valueKey: string;
}) {
  const colors = ['#1d4ed8', '#0f766e', '#9333ea', '#f59e0b'];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={100} label>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

