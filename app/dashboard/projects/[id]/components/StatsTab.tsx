// app/dashboard/projects/[id]/components/StatsTab.tsx
'use client' 

import React, { useMemo, useState, useEffect } from 'react';
import { Task, UserProfile } from '@/lib/types';
import { UserProfileWithId } from '@/hooks/data/useProjectData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid, // Import CartesianGrid
} from 'recharts';

interface Props {
  tasks: Task[];
  members: UserProfileWithId[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

export function StatsTab({ tasks, members }: Props) {
  
  const taskStatusData = useMemo(() => {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const inProgress = tasks.filter(t => t.status === 'inProgress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    return [
      { name: 'To Do', value: todo },
      { name: 'In Progress', value: inProgress },
      { name: 'Done', value: done },
    ];
  }, [tasks]);

  const workloadData = useMemo(() => {
    if (!members || members.length === 0) return [];
    
    const taskCounts = new Map<string, number>();
    tasks.forEach(task => {
      if (task.status !== 'done') {
        taskCounts.set(task.assignedTo, (taskCounts.get(task.assignedTo) || 0) + 1);
      }
    });

    return members.map(user => ({
      name: (user.displayName || user.email || 'Unknown').split(' ')[0],
      tasks: taskCounts.get(user.id) || 0,
    }));
  }, [tasks, members]);
  
  const totalTasks = tasks.length;
  const doneTasks = taskStatusData[2].value;
  const openTasks = taskStatusData[0].value + taskStatusData[1].value;

  // Styled Tooltip from AnalyticsPage
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white border-2 border-black rounded-lg shadow-md">
          <p className="font-bold text-black">{label}</p>
          <p className="text-sm text-black">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Tasks" value={totalTasks} />
        <StatCard title="Completed Tasks" value={doneTasks} />
        <StatCard title="Open Tasks" value={openTasks} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Styled Pie Chart Card */}
        <Card className="bg-white border-2 border-black rounded-lg">
          <CardHeader>
            <CardTitle className="text-black">Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={taskStatusData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  fill="#8884d8" 
                  label 
                  stroke="#000" // Add black stroke to pie slices
                  strokeWidth={2}
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Styled Bar Chart Card */}
        <Card className="bg-white border-2 border-black rounded-lg">
          <CardHeader>
            <CardTitle className="text-black">Open Task Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workloadData}>
                {/* Styled Grid, Axes, and Bar */}
                <CartesianGrid stroke="rgba(0, 0, 0, 0.1)" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  stroke="#000" 
                  tick={{ fill: '#000', fontSize: 12 }} 
                />
                <YAxis 
                  allowDecimals={false} 
                  stroke="#000" 
                  tick={{ fill: '#000', fontSize: 12 }} 
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} 
                />
                <Bar 
                  dataKey="tasks" 
                  fill="#8884d8" 
                  stroke="#000" 
                  strokeWidth={2} 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component (Styled)
function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card className="bg-white border-2 border-black rounded-lg">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-black">{value}</p>
      </CardContent>
    </Card>
  );
}